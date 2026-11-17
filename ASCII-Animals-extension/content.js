(() => {
  const { Engine, animals, names, panelData } = globalThis.__ASCII_BG__ || {};
  if (!Engine || document.getElementById('ascii-bg-canvas')) return;

  const DEFAULTS = { enabled: true, animal: 'butterflies', opacity: 0.35, mode: 'background' };
  const root = document.documentElement;
  let engine = null, canvas = null, panel = null;
  let settings = { ...DEFAULTS };
  let loadToken = 0;

  const lum = (c) => { const m = c.match(/[\d.]+/g); return m ? (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255 : 0; };
  const isDark = () => {
    const h = root.classList, b = document.body.classList;
    if (h.contains('dark') || b.contains('dark-theme') || b.contains('dark')) return true;
    if (h.contains('light') || b.contains('light-theme') || b.contains('light')) return false;
    return lum(getComputedStyle(document.body).color) > 0.5; // light text => dark page
  };


  // Background mode: instead of guessing site-specific class names, find the big opaque layers that
  // cover most of the viewport (at a few sample points) and make just those transparent.
  const MARK = 'data-ascii-bg-clear';
  let pageColor = null, lastScan = 0, scanTimer = 0;
  const alphaOf = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 0; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
  const clearMarks = () => { document.querySelectorAll('[' + MARK + ']').forEach((e) => e.removeAttribute(MARK)); pageColor = null; };
  function scan() {
    lastScan = Date.now();
    if (!settings.enabled || settings.mode === 'overlay' || !document.body) return;
    const vw = innerWidth, vh = innerHeight, seen = new Set();
    for (const [fx, fy] of [[0.5, 0.5], [0.5, 0.1], [0.5, 0.9], [0.95, 0.5], [0.3, 0.3], [0.7, 0.7]]) {
      for (const el of document.elementsFromPoint(vw * fx, vh * fy)) {
        if (seen.has(el)) continue; seen.add(el);
        if (el === canvas || el.id === 'ascii-bg-tweaks-host' || el.closest('[role="dialog"],[aria-modal="true"],dialog')) continue;
        const r = el.getBoundingClientRect();
        if (Math.min(r.right, vw) - Math.max(r.left, 0) < vw * 0.55 || Math.min(r.bottom, vh) - Math.max(r.top, 0) < vh * 0.5) continue;
        const cs = getComputedStyle(el), a = alphaOf(cs.backgroundColor);
        if (a > 0.02 || cs.backgroundImage !== 'none') {
          if (!pageColor && a > 0.9 && el !== root && el !== document.body && !el.hasAttribute(MARK)) pageColor = cs.backgroundColor;
          el.setAttribute(MARK, '');
        }
      }
    }
    applyClasses();
  }
  const scheduleScan = () => {
    if (scanTimer) return;
    scanTimer = setTimeout(() => { scanTimer = 0; scan(); }, Math.max(100, 1500 - (Date.now() - lastScan)));
  };

  const debounce = (fn, ms) => { let t = 0; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const saveSetting = debounce((k, v) => chrome.storage.sync.set({ [k]: v }), 250);

  // ---- per-animal tuning (only the differences from the animal's defaults are stored) ----
  const tuningKey = (a) => `tuning:${a}`;
  const tuningDiff = () => {
    const d = animals[settings.animal].defaults, out = {};
    if (engine) for (const k of Object.keys(d)) if (engine.tuning[k] !== d[k]) out[k] = engine.tuning[k];
    return out;
  };
  let tuningTimer = 0;
  const writeTuning = () => {
    clearTimeout(tuningTimer); tuningTimer = 0;
    if (!engine || engine.animal !== animals[settings.animal]) return;
    const key = tuningKey(settings.animal), diff = tuningDiff();
    if (Object.keys(diff).length) chrome.storage.local.set({ [key]: diff }); else chrome.storage.local.remove(key);
  };
  const saveTuning = () => { clearTimeout(tuningTimer); tuningTimer = setTimeout(writeTuning, 300); };
  const loadTuning = (animal) => new Promise((res) => chrome.storage.local.get(tuningKey(animal), (r) => res(r[tuningKey(animal)] || {})));

  function applyClasses() {
    root.classList.toggle('ascii-bg-on', settings.enabled);
    root.classList.toggle('ascii-bg-mode-background', settings.mode !== 'overlay');
    root.classList.toggle('ascii-bg-mode-overlay', settings.mode === 'overlay');
    root.classList.toggle('ascii-bg-dark', isDark());
    root.style.setProperty('--ascii-bg-opacity', String(settings.opacity));
    root.style.setProperty('--ascii-bg-page', pageColor || (isDark() ? '#212121' : '#ffffff'));
  }

  const api = {
    getEngine: () => engine,
    getSettings: () => settings,
    setTuning(k, v) { if (engine) { engine.set(k, v); saveTuning(); } },
    setSetting(k, v) {
      if (k === 'animal') writeTuning(); // flush the old animal's pending tweaks first
      settings[k] = v; saveSetting(k, v); applyClasses();
      if (k === 'animal') sync();
      if (k === 'mode') { if (v === 'overlay') clearMarks(); else scan(); }
    },
    exportState: () => ({ animal: settings.animal, tuning: tuningDiff(), opacity: settings.opacity, mode: settings.mode }),
    resetAnimal() {
      const d = animals[settings.animal].defaults;
      if (engine) for (const k of Object.keys(d)) engine.set(k, d[k]);
      chrome.storage.local.remove(tuningKey(settings.animal));
      settings.opacity = DEFAULTS.opacity; settings.mode = DEFAULTS.mode;
      chrome.storage.sync.set({ opacity: DEFAULTS.opacity, mode: DEFAULTS.mode });
      applyClasses();
    },
  };

  async function start() {
    if (engine || !settings.enabled) return;
    const token = ++loadToken;
    const animal = names.includes(settings.animal) ? settings.animal : DEFAULTS.animal;
    const tuning = await loadTuning(animal);
    if (token !== loadToken || engine || !settings.enabled) return;
    canvas = document.createElement('canvas');
    canvas.id = 'ascii-bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    engine = new Engine(canvas, { animal, theme: isDark() ? 'dark' : 'light', tuning });
    if (!panel) panel = globalThis.__ASCII_PANEL__(api);
    scan(); setTimeout(scan, 800); setTimeout(scan, 3000);
  }

  function stop() {
    loadToken++;
    if (panel) { panel.destroy(); panel = null; }
    if (engine) { engine.destroy(); engine = null; }
    if (canvas) { canvas.remove(); canvas = null; }
    clearMarks();
  }

  async function sync() {
    applyClasses();
    if (!settings.enabled) return stop();
    if (!engine) return start();
    engine.setTheme(isDark() ? 'dark' : 'light');
    if (engine.animal !== animals[settings.animal]) {
      const token = ++loadToken;
      const tuning = await loadTuning(settings.animal);
      if (token !== loadToken || !engine) return;
      engine.setAnimal(settings.animal, tuning);
      if (panel) panel.rebuildIfOpen();
    }
  }

  // Sites toggle the theme with a class on <html> or <body> (ChatGPT: html.dark, Gemini: body.dark-theme).
  const onTheme = () => {
    if (!engine) return;
    clearMarks(); // let the new theme's colours show so the page colour can be read again
    engine.setTheme(isDark() ? 'dark' : 'light'); scan();
  };
  new MutationObserver(onTheme).observe(root, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(onTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onTheme);
  addEventListener('resize', scheduleScan);

  // The page is a single-page app: keep the canvas attached if <body> children get replaced.
  new MutationObserver(() => {
    if (settings.enabled && canvas && !canvas.isConnected) document.body.prepend(canvas);
  }).observe(document.body, { childList: true });
  // Layout changes (navigation, sidebar open/close, new chat) can introduce new opaque layers.
  new MutationObserver(() => { if (engine) scheduleScan(); }).observe(document.body, { childList: true, subtree: true });

  chrome.storage.sync.get(DEFAULTS, (stored) => { settings = { ...DEFAULTS, ...stored }; sync(); });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    let animalChanged = false;
    for (const [k, v] of Object.entries(changes)) { if (k === 'animal' && v.newValue !== settings.animal) animalChanged = true; settings[k] = v.newValue; }
    if (animalChanged || 'enabled' in changes) sync(); else { applyClasses(); if (panel) panel.rebuildIfOpen(); }
  });
  chrome.runtime.onMessage.addListener((msg) => { if (msg && msg.type === 'ascii-open-panel' && panel) panel.open(); });
})();
