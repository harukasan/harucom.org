// Writes a Harucom OS UF2 image to a Harucom board over WebUSB.
//
// The board exposes the PICOBOOT vendor interface while it is in BOOTSEL mode,
// which is the only way a browser can reach its flash: the mass storage device
// next to it is not writable from a web page. The PICOBOOT protocol itself is
// handled by the vendored picoflash library.

// Upstream's index.js re-exports two constants that constants.js no longer has,
// which makes the barrel file fail to resolve, so these are imported directly.
import { Picoboot } from './picoflash/picoboot.js';
import { Target } from './picoflash/target.js';
import { PicobootStatus } from './picoflash/commands.js';
import { parseUf2, totalBytes } from './uf2.js';

const SECTOR_SIZE = 4096;
const PAGE_SIZE = 256;

// Erase in 64 KiB pieces: the bootrom uses a block erase instead of 16 sector
// erases when the range is aligned, which is several times faster. Writes go a
// sector at a time, which is what picotool does. Both sizes trade throughput
// against how often progress moves, so they are worth re-measuring on hardware.
const ERASE_CHUNK = 65536;
const WRITE_CHUNK = 4096;

// How much of each segment is read back afterwards. Reading everything would
// take about as long as writing it, and every command is acknowledged by the
// device already, so this is a sanity check rather than a full verification.
const VERIFY_WINDOW = 4096;

const ERASE_TIMEOUT_MS = 30000;
const WRITE_TIMEOUT_MS = 15000;

export class FlashError extends Error {
  constructor(reason, cause) {
    super(cause ? `${reason}: ${cause.message}` : reason);
    this.name = 'FlashError';
    this.reason = reason;
    this.cause = cause;
  }
}

function alignDown(value, alignment) {
  return value - (value % alignment);
}

function alignUp(value, alignment) {
  return Math.ceil(value / alignment) * alignment;
}

function withTimeout(promise, ms, reason) {
  let timer;
  const guard = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new FlashError(reason)), ms);
  });
  return Promise.race([promise, guard]).finally(() => clearTimeout(timer));
}

// Turns segments into the erase ranges and page aligned writes the device wants.
export function planWrite(segments) {
  const ranges = [];
  for (const segment of segments) {
    const start = alignDown(segment.addr, SECTOR_SIZE);
    const end = alignUp(segment.addr + segment.data.length, SECTOR_SIZE);
    const last = ranges[ranges.length - 1];
    if (last && start <= last.end) {
      last.end = Math.max(last.end, end);
    } else {
      ranges.push({ start, end });
    }
  }

  const erases = [];
  for (const range of ranges) {
    let addr = range.start;
    while (addr < range.end) {
      // Stop at the next 64 KiB boundary so the following chunks stay aligned.
      const next = Math.min(range.end, alignUp(addr + 1, ERASE_CHUNK));
      erases.push({ addr, size: next - addr });
      addr = next;
    }
  }

  const writes = [];
  for (const segment of segments) {
    if (segment.addr % PAGE_SIZE !== 0) {
      throw new FlashError('unaligned-segment');
    }
    // The last block of an image rarely fills a page. Flash reads as 0xff after
    // an erase, so padding with 0xff leaves the tail exactly as erased.
    let data = segment.data;
    const padded = alignUp(data.length, PAGE_SIZE);
    if (padded !== data.length) {
      const buffer = new Uint8Array(padded).fill(0xff);
      buffer.set(data);
      data = buffer;
    }
    for (let offset = 0; offset < data.length; offset += WRITE_CHUNK) {
      writes.push({
        addr: segment.addr + offset,
        data: data.subarray(offset, Math.min(offset + WRITE_CHUNK, data.length)),
      });
    }
  }

  return {
    erases,
    writes,
    eraseBytes: erases.reduce((sum, e) => sum + e.size, 0),
    writeBytes: writes.reduce((sum, w) => sum + w.data.length, 0),
  };
}

// Asks the user to pick a board. Throws FlashError('cancelled') if they don't.
export async function requestDevice() {
  if (!('usb' in navigator)) throw new FlashError('unsupported');
  try {
    return await Picoboot.requestDevice([new Target('RP2350')]);
  } catch (e) {
    throw new FlashError(classify(e), e);
  }
}

// Writes an image and reboots the board into it.
//
// `onProgress(phase, done, total)` is called as each chunk completes, with phase
// one of 'erase', 'write' or 'verify'.
export async function flash(picoboot, buffer, onProgress = () => {}) {
  const segments = parseUf2(buffer);
  const plan = planWrite(segments);

  let connection;
  try {
    connection = await picoboot.connect();
    // 2 = take exclusive access and eject the mass storage device, so the host
    // operating system stops touching the board while we write to it.
    await connection.setExclusiveAccess(2);
    await connection.exitXip();
  } catch (e) {
    throw new FlashError(classify(e), e);
  }

  try {
    let erased = 0;
    onProgress('erase', 0, plan.eraseBytes);
    for (const erase of plan.erases) {
      await withTimeout(connection.flashErase(erase.addr, erase.size), ERASE_TIMEOUT_MS, 'timeout');
      erased += erase.size;
      onProgress('erase', erased, plan.eraseBytes);
    }

    let written = 0;
    onProgress('write', 0, plan.writeBytes);
    for (const write of plan.writes) {
      await withTimeout(connection.flashWrite(write.addr, write.data), WRITE_TIMEOUT_MS, 'timeout');
      written += write.data.length;
      onProgress('write', written, plan.writeBytes);
    }

    await verify(connection, segments, onProgress);

    await connection.reboot(500);
  } catch (e) {
    const error = e instanceof FlashError ? e : new FlashError(classify(e), e);
    // picoflash never checks GET_CMD_STATUS, so a device side rejection such as
    // BAD_ALIGNMENT only shows up as a stalled transfer. Asking for the status
    // once we have already failed turns that into something diagnosable.
    error.deviceStatus = await readStatus(connection);
    throw error;
  } finally {
    // The board is already gone once it reboots, so failing to close is normal.
    try { await picoboot.disconnect(); } catch (e) { /* ignore */ }
  }

  return { segments, bytes: totalBytes(segments) };
}

async function readStatus(connection) {
  try {
    const status = await withTimeout(connection.getCommandStatus(), 2000, 'timeout');
    const code = status.getStatusCode ? status.getStatusCode() : null;
    if (code === null || code === PicobootStatus.OK) return null;
    return status.getStatusName ? status.getStatusName() : `status ${code}`;
  } catch (e) {
    return null;
  }
}

async function verify(connection, segments, onProgress) {
  const windows = [];
  for (const segment of segments) {
    const length = alignUp(segment.data.length, PAGE_SIZE);
    const size = Math.min(VERIFY_WINDOW, length);
    windows.push({ segment, offset: 0, size });
    if (length > size) windows.push({ segment, offset: alignDown(length - size, PAGE_SIZE), size });
  }

  const total = windows.reduce((sum, w) => sum + w.size, 0);
  let done = 0;
  onProgress('verify', 0, total);

  for (const window of windows) {
    const actual = await withTimeout(
      connection.flashRead(window.segment.addr + window.offset, window.size),
      WRITE_TIMEOUT_MS,
      'timeout'
    );
    for (let i = 0; i < window.size; i++) {
      // Anything past the end of the image was padded with 0xff before writing.
      const expected = window.segment.data[window.offset + i] ?? 0xff;
      if (actual[i] !== expected) {
        throw new FlashError('verify-failed');
      }
    }
    done += window.size;
    onProgress('verify', done, total);
  }
}

// Maps a WebUSB or picoflash failure onto a reason the page has wording for.
function classify(error) {
  const original = error && error.originalError ? error.originalError : error;
  const name = original && original.name ? original.name : '';
  const message = `${error && error.message ? error.message : ''} ${original && original.message ? original.message : ''}`;

  if (name === 'NotFoundError') return 'cancelled';
  if (name === 'SecurityError' || /access denied/i.test(message)) return 'permission';
  if (/claim interface/i.test(message)) return 'busy';
  if (name === 'NetworkError' || /disconnected|no device selected for transfer|device unavailable/i.test(message)) {
    return 'disconnected';
  }
  return 'usb';
}
