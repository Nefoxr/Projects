/* Tweaks panel (Shadow DOM, so ChatGPT's CSS can't touch it and vice versa).
   Mirrors the original extension's Tweaks panel: Movement / animal-specific / Look,
   plus a "Background" group for this extension (visibility, mode). */
globalThis.__ASCII_PANEL__ = function createPanel(api) {
  const { animals, names, common, bgDefaults } = globalThis.__ASCII_BG__.panelData;
  const host = document.createElement('div');
  host.id = 'ascii-bg-tweaks-host';
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;right:0;bottom:0;';
  const root = host.attachShadow({ mode: 'open' });
  // Built with DOM APIs only (no innerHTML): sites like Gemini enforce Trusted Types.
  const NS = 'http://www.w3.org/2000/svg';
  const svgIcon = (size, sw, paths) => {
    const svg = document.createElementNS(NS, 'svg');
    for (const [k, v] of Object.entries({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': sw, 'stroke-linecap': 'round' })) svg.setAttribute(k, v);
    for (const p of paths) {
      const n = document.createElementNS(NS, p.c ? 'circle' : 'path');
      for (const [k, v] of Object.entries(p)) n.setAttribute(k, v);
      svg.append(n);
    }
    return svg;
  };
  const mk = (tag, props = {}, ...kids) => { const n = document.createElement(tag); Object.assign(n, props); n.append(...kids); return n; };
  const style = mk('style'); style.textContent = `
  :host{all:initial}
  *{box-sizing:border-box}
  .open-btn{position:fixed;right:14px;bottom:14px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.18);
    background:rgba(20,22,31,.78);color:#e8ebf7;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(8px);opacity:.55;transition:opacity .15s}
  .open-btn:hover{opacity:1}
  aside{position:fixed;right:14px;bottom:14px;width:290px;max-height:calc(100vh - 28px);display:flex;flex-direction:column;
    background:rgba(14,16,24,.88);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.14);border-radius:18px;
    box-shadow:0 16px 48px rgba(0,0,0,.55);color:#e8ebf7;font:12px/1.35 ui-sans-serif,system-ui,sans-serif}
  [hidden]{display:none!important}
  header{display:flex;align-items:center;gap:6px;padding:12px 12px 10px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
  h2{margin:0;font-size:14px;font-weight:600;flex:1}
  button{font:inherit;color:inherit;cursor:pointer}
  .act{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 11px}
  .act:hover{background:rgba(255,255,255,.14)} .act.confirm{border-color:#ff7a7a;color:#ff9a9a}
  .x{background:none;border:0;padding:4px;opacity:.7} .x:hover{opacity:1}
  .body{overflow-y:auto;padding:4px 16px 14px;scrollbar-width:thin}
  section{margin-top:12px}
  section>h3{margin:0 0 8px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7f88a8;cursor:pointer;display:flex;justify-content:space-between;user-select:none}
  section>h3::after{content:"▾";letter-spacing:0} section.closed>h3::after{content:"▸"} section.closed .rows{display:none}
  .row{display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center;margin-bottom:11px}
  .row.off{opacity:.4}
  .lab{font-size:12px;cursor:default} .val{font:600 11px ui-monospace,Menlo,monospace;text-align:right}
  input[type=range]{grid-column:1/3;width:100%;margin:0;height:14px;-webkit-appearance:none;background:transparent}
  input[type=range]::-webkit-slider-runnable-track{height:3px;border-radius:3px;background:linear-gradient(90deg,#7aa2ff var(--fill,0%),rgba(255,255,255,.14) var(--fill,0%))}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;margin-top:-5.5px;box-shadow:0 1px 4px rgba(0,0,0,.5)}
  input[type=checkbox]{accent-color:#7aa2ff;width:16px;height:16px}
  select{grid-column:1/3;width:100%;background:rgba(255,255,255,.07);color:#e8ebf7;border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:6px 8px;font:inherit}
  select option{background:#171a26}
  .tip{position:fixed;max-width:220px;padding:8px 10px;border-radius:10px;background:rgba(10,12,18,.96);border:1px solid rgba(255,255,255,.14);color:#cfd5ea;pointer-events:none}
  .tip small{display:block;color:#7f88a8;margin-top:4px}
`;
  const openBtn0 = mk('button', { className: 'open-btn', title: 'ASCII background tweaks' }, svgIcon(15, 2, [
    { d: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0' }, { cx: 16, cy: 6, r: 2, c: 1 }, { cx: 10, cy: 12, r: 2, c: 1 }, { cx: 18, cy: 18, r: 2, c: 1 }]));
  openBtn0.setAttribute('aria-label', 'Tweaks');
  const closeBtn0 = mk('button', { className: 'x', id: 'close' }, svgIcon(14, 2.2, [{ d: 'M6 6l12 12M18 6 6 18' }]));
  closeBtn0.setAttribute('aria-label', 'Close');
  const aside0 = mk('aside', { hidden: true },
    mk('header', {}, mk('h2', { textContent: 'Tweaks' }), mk('button', { className: 'act', id: 'copy', textContent: 'Copy' }),
      mk('button', { className: 'act', id: 'reset', textContent: 'Reset' }), closeBtn0),
    mk('div', { className: 'body' }));
  aside0.setAttribute('aria-label', 'Tweaks');
  root.append(style, openBtn0, aside0, mk('div', { className: 'tip', hidden: true }));
  document.documentElement.appendChild(host);
  // Clicks inside the panel must not "startle" the animals.
  host.addEventListener('pointerdown', (e) => e.stopPropagation());

  const $ = (sel) => root.querySelector(sel);
  const panel = $('aside'), openBtn = $('.open-btn'), body = $('.body'), tip = $('.tip');
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const decimals = (step) => (step >= 1 ? 0 : Math.min(3, Math.ceil(-Math.log10(step))));
  const closedGroups = new Set(['Look']);
  let refreshers = [];

  function showTip(row, text) {
    if (!text) return;
    tip.replaceChildren();
    tip.append(el('span', '', text), el('small', '', 'Double-click the name to reset it.'));
    tip.hidden = false;
    const r = row.getBoundingClientRect(), p = panel.getBoundingClientRect();
    tip.style.right = `${innerWidth - p.left + 10}px`;
    tip.style.top = `${Math.max(8, Math.min(innerHeight - tip.offsetHeight - 8, r.top + r.height / 2 - tip.offsetHeight / 2))}px`;
  }

  function rangeRow(c) {
    const row = el('div', 'row'), lab = el('span', 'lab', c.label), out = el('output', 'val'), inp = el('input');
    inp.type = 'range'; inp.min = c.min; inp.max = c.max; inp.step = c.step;
    const refresh = () => {
      const v = c.get(); inp.value = v; out.textContent = Number(v).toFixed(decimals(c.step));
      inp.style.setProperty('--fill', `${((v - c.min) / (c.max - c.min)) * 100}%`);
      const off = c.disabled ? c.disabled() : false; inp.disabled = off; row.classList.toggle('off', off);
    };
    inp.addEventListener('input', () => { c.set(Number(inp.value)); refreshAll(); });
    lab.addEventListener('dblclick', () => { c.set(c.def); refreshAll(); });
    row.append(lab, out, inp); hookTip(row, c.hint); refreshers.push(refresh); return row;
  }
  function toggleRow(c) {
    const row = el('div', 'row'), lab = el('span', 'lab', c.label), inp = el('input');
    inp.type = 'checkbox';
    inp.addEventListener('change', () => { c.set(inp.checked); refreshAll(); });
    lab.addEventListener('dblclick', () => { c.set(c.def); refreshAll(); });
    row.append(lab, inp); hookTip(row, c.hint); refreshers.push(() => { inp.checked = !!c.get(); }); return row;
  }
  function selectRow(c) {
    const row = el('div', 'row'), lab = el('span', 'lab', c.label), sel = el('select');
    for (const [v, t] of c.options) { const o = el('option', '', t); o.value = v; sel.append(o); }
    sel.addEventListener('change', () => c.set(sel.value));
    row.append(lab, sel); refreshers.push(() => { sel.value = c.get(); }); return row;
  }
  function hookTip(row, hint) {
    row.addEventListener('pointerenter', () => showTip(row, hint));
    row.addEventListener('pointerleave', () => { tip.hidden = true; });
  }
  const refreshAll = () => refreshers.forEach((f) => f());

  function build() {
    body.replaceChildren(); refreshers = [];
    const s = api.getSettings(), animalKey = s.animal, animal = animals[animalKey], hide = new Set(animal.hide || []);
    const knob = (o) => {
      if ('toggle' in o) return { kind: 'toggle', ...o, def: animal.defaults[o.key], get: () => api.getEngine()?.tuning[o.key] ?? animal.defaults[o.key], set: (v) => api.setTuning(o.key, v) };
      return { kind: 'range', ...o, def: animal.defaults[o.key], get: () => api.getEngine()?.tuning[o.key] ?? animal.defaults[o.key], set: (v) => api.setTuning(o.key, v),
        disabled: o.disabledWhen ? () => !!api.getEngine()?.tuning[o.disabledWhen] : undefined };
    };
    const groups = [
      ['Scene', [
        { kind: 'select', label: 'Animal', options: names.map((n) => [n, animals[n].label || n]), get: () => api.getSettings().animal, set: (v) => { api.setSetting('animal', v); } },
        { kind: 'range', label: 'Visibility', min: 0.1, max: 1, step: 0.05, def: bgDefaults.opacity, hint: 'How strongly the animals show through behind the chat.', get: () => api.getSettings().opacity, set: (v) => api.setSetting('opacity', v) },
        { kind: 'select', label: 'Mode', options: [['background', 'Background (behind the chat)'], ['overlay', 'Overlay (fallback, above the page)']], get: () => api.getSettings().mode, set: (v) => api.setSetting('mode', v) },
      ]],
      ['Movement', common.movement.filter((o) => !hide.has(o.key)).map(knob)],
      ...animal.controls.map(([name, list]) => [name, list.map(knob)]),
      ['Look', common.look.filter((o) => !hide.has(o.key)).map(knob)],
    ];
    for (const [name, list] of groups) {
      const sec = el('section'); if (closedGroups.has(name)) sec.classList.add('closed');
      const h = el('h3', '', name); h.addEventListener('click', () => { sec.classList.toggle('closed'); sec.classList.contains('closed') ? closedGroups.add(name) : closedGroups.delete(name); });
      const rows = el('div', 'rows');
      for (const c of list) rows.append(c.kind === 'select' ? selectRow(c) : c.kind === 'toggle' ? toggleRow(c) : rangeRow(c));
      sec.append(h, rows); body.append(sec);
    }
    refreshAll();
  }

  // Copy / Reset / open / close
  const copyBtn = $('#copy'), resetBtn = $('#reset');
  copyBtn.addEventListener('click', async () => {
    const out = JSON.stringify(api.exportState(), null, 2);
    try { await navigator.clipboard.writeText(out); copyBtn.textContent = 'Copied'; } catch { console.log(out); copyBtn.textContent = 'In console'; }
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1400);
  });
  let confirmTimer = 0;
  const clearConfirm = () => { clearTimeout(confirmTimer); confirmTimer = 0; resetBtn.textContent = 'Reset'; resetBtn.classList.remove('confirm'); };
  resetBtn.addEventListener('click', () => {
    if (!confirmTimer) { resetBtn.textContent = 'Reset all?'; resetBtn.classList.add('confirm'); confirmTimer = setTimeout(clearConfirm, 3000); return; }
    clearConfirm(); api.resetAnimal(); refreshAll();
  });
  const setOpen = (v) => { panel.hidden = !v; openBtn.hidden = v; tip.hidden = true; if (v) build(); };
  openBtn.addEventListener('click', () => setOpen(true));
  $('#close').addEventListener('click', () => setOpen(false));
  return { open: () => setOpen(true), close: () => setOpen(false), rebuildIfOpen: () => { if (!panel.hidden) build(); else refreshAll(); }, destroy: () => host.remove() };
};
