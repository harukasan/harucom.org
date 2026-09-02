// UF2 parser for Harucom OS firmware images.
//
// A UF2 file is a sequence of 512 byte blocks, each carrying up to 476 bytes of
// payload and the flash address it belongs to. Harucom OS images are not one
// contiguous run: the firmware sits at 0x10000000 and the dictionary at
// 0x10600000, with a gap in between. Flattening the whole file into a single
// buffer would make us erase and transfer the gap as well, so blocks are grouped
// into segments of consecutive addresses instead.

const MAGIC0 = 0x0a324655;
const MAGIC1 = 0x9e5d5157;
const MAGIC_END = 0x0ab16f30;

const FLAG_NOT_MAIN_FLASH = 0x00000001;
const FLAG_FILE_CONTAINER = 0x00001000;
const FLAG_FAMILY_ID_PRESENT = 0x00002000;

export const BLOCK_SIZE = 512;
export const MAX_PAYLOAD_SIZE = 476;
export const FAMILY_RP2350_ARM_S = 0xe48bff59;

// The first 8MB of the board's flash holds the firmware, the rest is the FAT
// filesystem where the user's own files live. Refusing to write past the
// boundary means a stray UF2 can never take somebody's files with it.
export const FIRMWARE_START = 0x10000000;
export const FIRMWARE_END = 0x10800000;

export class Uf2Error extends Error {
  constructor(reason, message) {
    super(message || reason);
    this.name = 'Uf2Error';
    this.reason = reason;
  }
}

// Parses a UF2 image into segments of consecutive flash addresses.
//
// Returns [{ addr, data: Uint8Array }], sorted by address. Throws Uf2Error with
// reason 'invalid' for a malformed file, 'family' for an image built for a
// different chip, and 'out-of-range' for one that would reach outside the
// firmware area.
export function parseUf2(buffer, options = {}) {
  const {
    familyId = FAMILY_RP2350_ARM_S,
    rangeStart = FIRMWARE_START,
    rangeEnd = FIRMWARE_END,
  } = options;
  const bytes = new Uint8Array(buffer);

  if (bytes.length === 0 || bytes.length % BLOCK_SIZE !== 0) {
    throw new Uf2Error('invalid', `File size ${bytes.length} is not a multiple of ${BLOCK_SIZE}`);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const blocks = [];

  for (let offset = 0; offset < bytes.length; offset += BLOCK_SIZE) {
    if (view.getUint32(offset, true) !== MAGIC0 ||
        view.getUint32(offset + 4, true) !== MAGIC1 ||
        view.getUint32(offset + BLOCK_SIZE - 4, true) !== MAGIC_END) {
      throw new Uf2Error('invalid', `Bad UF2 magic at offset ${offset}`);
    }

    const flags = view.getUint32(offset + 8, true);
    if (flags & FLAG_FILE_CONTAINER) {
      throw new Uf2Error('invalid', 'File container images cannot be flashed');
    }
    if (flags & FLAG_NOT_MAIN_FLASH) continue;

    if ((flags & FLAG_FAMILY_ID_PRESENT) === 0) {
      throw new Uf2Error('family', `Block at offset ${offset} carries no family ID`);
    }
    const family = view.getUint32(offset + 28, true);
    if (family !== familyId) {
      throw new Uf2Error('family', `Family ID 0x${family.toString(16)} is not 0x${familyId.toString(16)}`);
    }

    const payloadSize = view.getUint32(offset + 16, true);
    if (payloadSize === 0 || payloadSize > MAX_PAYLOAD_SIZE) {
      throw new Uf2Error('invalid', `Bad payload size ${payloadSize} at offset ${offset}`);
    }

    const addr = view.getUint32(offset + 12, true);
    if (addr < rangeStart || addr + payloadSize > rangeEnd) {
      throw new Uf2Error('out-of-range', `Block at offset ${offset} targets 0x${addr.toString(16)}`);
    }

    blocks.push({ addr, payload: bytes.subarray(offset + 32, offset + 32 + payloadSize) });
  }

  if (blocks.length === 0) {
    throw new Uf2Error('invalid', 'No flashable blocks found');
  }

  blocks.sort((a, b) => a.addr - b.addr);

  // Group consecutive blocks. Overlapping blocks mean the image is inconsistent.
  const groups = [];
  let group = null;
  for (const block of blocks) {
    if (group && block.addr === group.end) {
      group.blocks.push(block);
      group.end += block.payload.length;
      continue;
    }
    if (group && block.addr < group.end) {
      throw new Uf2Error('invalid', `Overlapping blocks at 0x${block.addr.toString(16)}`);
    }
    group = { addr: block.addr, end: block.addr + block.payload.length, blocks: [block] };
    groups.push(group);
  }

  return groups.map((g) => {
    const data = new Uint8Array(g.end - g.addr);
    let pos = 0;
    for (const block of g.blocks) {
      data.set(block.payload, pos);
      pos += block.payload.length;
    }
    return { addr: g.addr, data };
  });
}

export function totalBytes(segments) {
  return segments.reduce((sum, s) => sum + s.data.length, 0);
}
