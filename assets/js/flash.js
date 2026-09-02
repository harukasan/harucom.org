// Wiring for the /flash/ page: reads its configuration out of the document,
// drives the flasher and reflects progress back into the DOM.
//
// Every visible string comes from _data/flash_ui.yml through a JSON island, so
// this file never needs to know which language the page is in.

import { flash, requestDevice, FlashError } from './flasher.js';

const PHASES = [
  { name: 'download', weight: 0.15 },
  { name: 'erase', weight: 0.45 },
  { name: 'write', weight: 0.3 },
  { name: 'verify', weight: 0.1 },
];

const app = document.getElementById('flash-app');
if (app) start(app);

function start(root) {
  const config = JSON.parse(document.getElementById('flash-config').textContent);
  const text = config.strings;
  const el = {
    state: root,
    button: root.querySelector('#flash-start'),
    file: root.querySelector('#flash-file'),
    steps: root.querySelectorAll('.flash-step'),
    bar: root.querySelector('#flash-bar-fill'),
    track: root.querySelector('#flash-bar'),
    phase: root.querySelector('#flash-phase'),
    detail: root.querySelector('#flash-detail'),
    errorTitle: root.querySelector('#flash-error-title'),
    errorBody: root.querySelector('#flash-error-body'),
    errorTech: root.querySelector('#flash-error-tech'),
    noticeTitle: root.querySelector('#flash-notice-title'),
    noticeBody: root.querySelector('#flash-notice-body'),
  };

  if (!('usb' in navigator)) {
    el.noticeTitle.textContent = text.unsupported_title;
    el.noticeBody.textContent = text.unsupported_body;
    setState('unsupported');
    return;
  }
  if (!window.isSecureContext) {
    el.noticeTitle.textContent = text.insecure_title;
    el.noticeBody.textContent = text.insecure_body;
    setState('insecure');
    return;
  }

  setState('idle');

  let busy = false;
  let firmware = null;
  let wakeLock = null;

  // Warm the download up on hover so the bytes are usually already here by the
  // time the device picker closes.
  if (config.uf2Url) {
    root.addEventListener('pointerenter', ensureFirmware, { once: true });
  }

  el.button?.addEventListener('click', () => {
    // requestDevice() needs transient user activation, so it has to be the
    // first thing awaited in this handler. The download is kicked off without
    // awaiting it and picked up once a device has been chosen.
    ensureFirmware();
    run(ensureFirmware);
  });

  el.file?.addEventListener('change', () => {
    const file = el.file.files && el.file.files[0];
    if (!file) return;
    run(() => file.arrayBuffer());
  });

  root.querySelectorAll('[data-action="restart"]').forEach((button) => {
    button.addEventListener('click', () => {
      resetProgress();
      setState('idle');
    });
  });

  async function run(getImage) {
    if (busy) return;
    busy = true;
    resetProgress();
    setState('selecting');

    let picoboot;
    try {
      picoboot = await requestDevice();
    } catch (e) {
      busy = false;
      showError(e);
      return;
    }

    window.addEventListener('beforeunload', blockUnload);
    await takeWakeLock();

    try {
      setState('downloading');
      setPhase('download', 0, 1);
      const buffer = await getImage();
      setPhase('download', 1, 1);

      setState('flashing');
      await flash(picoboot, buffer, setPhase);

      setState('done');
    } catch (e) {
      showError(e);
    } finally {
      busy = false;
      window.removeEventListener('beforeunload', blockUnload);
      releaseWakeLock();
    }
  }

  // Starts the download once and hands the same promise to everyone. A failed
  // download is forgotten so that pressing the retry button fetches it again,
  // and the extra catch keeps a prefetch nobody waited on from being reported
  // as an unhandled rejection.
  function ensureFirmware() {
    if (!firmware) {
      firmware = download();
      firmware.catch(() => { firmware = null; });
    }
    return firmware;
  }

  async function download() {
    const response = await fetch(config.uf2Url);
    if (!response.ok) throw new FlashError('download');

    const total = Number(response.headers.get('content-length')) || config.size || 0;
    if (!response.body || !total) return response.arrayBuffer();

    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      setPhase('download', received, total);
    }

    const buffer = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    return buffer.buffer;
  }

  function setState(state) {
    el.state.dataset.state = state;
  }

  function setPhase(name, done, total) {
    const index = PHASES.findIndex((p) => p.name === name);
    if (index < 0) return;

    let overall = 0;
    for (let i = 0; i < index; i++) overall += PHASES[i].weight;
    overall += PHASES[index].weight * (total ? Math.min(done / total, 1) : 0);

    const percent = Math.round(overall * 100);
    el.bar.style.width = `${percent}%`;
    el.track.setAttribute('aria-valuenow', String(percent));
    el.phase.textContent = text.phases[name];
    el.detail.textContent = name === 'download' && total <= 1
      ? ''
      : `${formatSize(done)} / ${formatSize(total)}`;

    el.steps.forEach((step) => {
      const at = PHASES.findIndex((p) => p.name === step.dataset.step);
      step.dataset.stepState = at < index ? 'done' : at === index ? 'active' : 'pending';
    });
  }

  function resetProgress() {
    el.bar.style.width = '0%';
    el.track.setAttribute('aria-valuenow', '0');
    el.phase.textContent = '';
    el.detail.textContent = '';
    el.steps.forEach((step) => { step.dataset.stepState = 'pending'; });
  }

  function showError(error) {
    const reason = error instanceof FlashError || error.name === 'Uf2Error'
      ? error.reason
      : 'usb';

    let body = text.errors[reason] || text.errors.usb;
    if (reason === 'permission' && isLinux()) body = `${body}\n\n${text.errors.permission_linux}`;

    el.errorTitle.textContent = text.error_titles[reason] || text.error_titles.usb;
    el.errorBody.textContent = body;
    el.errorTech.textContent = [
      error.name,
      error.message,
      error.deviceStatus ? `device status: ${error.deviceStatus}` : null,
    ].filter(Boolean).join('\n');

    setState(reason === 'cancelled' ? 'cancelled' : 'error');
    console.error('[flash]', error);
  }

  function blockUnload(event) {
    event.preventDefault();
    event.returnValue = '';
  }

  async function takeWakeLock() {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (e) {
      wakeLock = null;
    }
  }

  function releaseWakeLock() {
    try { wakeLock?.release(); } catch (e) { /* ignore */ }
    wakeLock = null;
  }
}

function formatSize(bytes) {
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function isLinux() {
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  return /linux/i.test(platform) && !/android/i.test(navigator.userAgent);
}
