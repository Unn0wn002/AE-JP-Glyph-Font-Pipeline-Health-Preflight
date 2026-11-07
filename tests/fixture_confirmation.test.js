'use strict';
// Controlled tests for fixtures/JPFP_Session1_CreateFixtures.jsx using plain JavaScript test doubles.
// They run the real builder source under Node's vm. They prove the builder's acceptance logic only;
// they never touch After Effects, never change real Source Text and are NOT host evidence.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SOURCE = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'JPFP_Session1_CreateFixtures.jsx'), 'utf8')
  .replace(/^#target.*$/m, '');

function loadHelpers() {
  const match = SOURCE.match(/JPFP-FIXTURE-HELPERS-BEGIN([\s\S]*?)JPFP-FIXTURE-HELPERS-END/);
  assert.ok(match, 'helper markers must exist in the builder');
  const context = {};
  vm.runInNewContext(`${match[1]}\nthis.api = { confirmWholeFont, confirmRangeFont, confirmFontName, createStepRunner, fontIdentity };`, context);
  return context.api;
}

// ---- text-layer double whose setValue persistence can be switched off ---------------------------
function makeFonts(opts = {}) {
  const make = (ps, chars) => ({ postScriptName: ps, fontID: ps, hasGlyphsFor: s => [...s].every(c => chars.includes(c)) });
  const fonts = { 'Default-PS': make('Default-PS', ''), 'JP-PS': make('JP-PS', '日本語。ABC123「」—・！？漢 の字幕です欠落フォント静的動的式で生成𠀋葛は') };
  if (!opts.onlyJp) { fonts['ArialMT'] = make('ArialMT', 'ABC123'); }
  return fonts;
}

function textLayer(fonts, world, text) {
  const state = { text, fontPS: 'Default-PS', fontName: 'Default-PS', ranges: {} };
  const snapshot = () => {
    const pending = { fontPS: state.fontPS, fontName: state.fontName, ranges: { ...state.ranges } };
    return {
      text: state.text, __pending: pending,
      get fontObject() { return fonts[pending.fontPS]; }, set fontObject(f) { pending.fontPS = f.postScriptName; },
      get font() { return pending.fontName; }, set font(n) { pending.fontName = n; },
      characterRange(s, e) {
        return { get fontObject() { return fonts[pending.ranges[`${s}_${e}`] || pending.fontPS]; }, set fontObject(f) { pending.ranges[`${s}_${e}`] = f.postScriptName; } };
      },
    };
  };
  const property = {
    get value() { return snapshot(); },
    setValue(td) {
      if (world.persist) { state.fontPS = td.__pending.fontPS; state.fontName = td.__pending.fontName; }
      if (world.rangePersist) { state.ranges = { ...td.__pending.ranges }; }
    },
    setValueAtTime() {},
  };
  const generic = { setValue() {} };
  return {
    name: '', state,
    property(id) {
      if (id === 'ADBE Text Properties') { return { property: () => property }; }
      return { property: () => generic };
    },
  };
}

function runBuilder(opts = {}) {
  const world = { persist: opts.persist !== false, rangePersist: opts.rangePersist !== undefined ? opts.rangePersist : opts.persist !== false };
  const fonts = makeFonts(opts);
  const alerts = [];
  const comps = [];
  const comp = (name) => {
    const c = { name, layersCreated: [], opened: false };
    c.layers = {
      addText(text) {
        if (opts.failOnText === text) { throw new Error('host failure on ' + JSON.stringify(text)); }
        if (opts.emptyReturnsUndefined && text === '') { return undefined; }
        const layer = textLayer(fonts, world, text);
        c.layersCreated.push(layer);
        return layer;
      },
      addSolid(color, name) { const l = { name, property: () => ({ property: () => ({ setValue() {} }) }) }; c.layersCreated.push(l); return l; },
    };
    c.openInViewer = () => { c.opened = true; };
    comps.push(c);
    return c;
  };
  const context = {
    confirm: () => true, alert: m => alerts.push(m), safeCalls: 0,
    app: {
      project: { items: { addComp: (name) => comp(name) } },
      fonts: { allFonts: [Object.values(fonts)] },
      beginUndoGroup() {}, endUndoGroup() {}, newProject() {},
    },
  };
  vm.runInNewContext(SOURCE, context);
  const text = alerts[alerts.length - 1];
  assert.ok(text, 'the builder must finish with a summary alert');
  const status = id => (text.match(new RegExp(`^${id}: (ACCEPTED|NOT ACCEPTED)(.*)$`, 'm')) || []);
  return { text, comps, status, main: comps.find(c => c.name === 'JPFP_S1_FIXTURES__DISPOSABLE'), alerts };
}

// ---- AE-05: persisted readback must confirm setter success ---------------------------------------
test('AE-05: when the setters persist, font-dependent fixtures are accepted after readback', () => {
  const r = runBuilder();
  for (const id of ['F01', 'F02', 'F03', 'F04', 'F05']) { assert.equal(r.status(id)[1], 'ACCEPTED', r.text); }
  assert.equal(r.status('F06')[1], 'ACCEPTED');
  assert.equal(r.main.layersCreated.length, 12);
});

test('AE-05: setters that return without persisting leave fixtures NOT ACCEPTED, with readback evidence', () => {
  const r = runBuilder({ persist: false });
  for (const id of ['F01', 'F02', 'F04']) {
    assert.equal(r.status(id)[1], 'NOT ACCEPTED', id);
    assert.match(r.status(id)[2], /UNCONFIRMED/, id);
  }
  assert.match(r.status('F01')[2], /requested=JP-PS, observed=Default-PS/);
  assert.equal(r.status('F06')[1], 'NOT ACCEPTED', 'every text fixture requests a whole-layer font, so none is accepted unconfirmed');
  assert.equal(r.status('F12')[1], 'ACCEPTED', 'the solid has no font request, so it needs no readback');
  assert.equal(r.main.layersCreated.length, 12, 'setup continues so each fixture reports independently');
});

test('AE-05: a range-font setter that does not persist rejects only the mixed-font fixture (as recorded natively on 24 Sep)', () => {
  const r = runBuilder({ rangePersist: false });
  assert.equal(r.status('F03')[1], 'NOT ACCEPTED');
  assert.match(r.status('F03')[2], /UNCONFIRMED range 4-7 font/);
  assert.equal(r.status('F01')[1], 'ACCEPTED');
  assert.equal(r.status('F04')[1], 'ACCEPTED');
});

test('AE-05: no glyph-gap candidate font means F05 is not accepted instead of silently passing', () => {
  const r = runBuilder({ onlyJp: true });
  assert.equal(r.status('F05')[1], 'NOT ACCEPTED');
  assert.match(r.status('F05')[2], /UNCONFIRMED glyph-gap candidate font: no installed candidate font found/);
});

test('AE-05: confirmation helpers compare fresh readback, never the setter result', () => {
  const api = loadHelpers();
  const fonts = makeFonts();
  const world = { persist: true, rangePersist: true };
  const layer = textLayer(fonts, world, 'ABC');
  assert.equal(api.confirmWholeFont(layer, fonts['JP-PS']).confirmed, false, 'nothing requested has been applied yet');
  const p = layer.property('ADBE Text Properties').property('x');
  const td = p.value; td.fontObject = fonts['JP-PS']; td.font = 'JP-PS'; p.setValue(td);
  assert.equal(api.confirmWholeFont(layer, fonts['JP-PS']).confirmed, true);
  assert.equal(api.confirmWholeFont(layer, null).confirmed, false);
  assert.equal(api.confirmWholeFont(layer, { postScriptName: '' }).confirmed, false);
  assert.equal(api.confirmRangeFont(layer, 0, 1, fonts['ArialMT']).confirmed, false);
  const broken = { property() { throw new Error('read failed'); } };
  const failed = api.confirmWholeFont(broken, fonts['JP-PS']);
  assert.equal(failed.confirmed, false);
  assert.match(failed.reason, /readback failed/);
  assert.equal(api.confirmFontName(layer, 'JP-PS').confirmed, true);
  assert.equal(api.confirmFontName(layer, 'Other').confirmed, false);
});

// ---- AE-06: a bad mixed-text fixture must not stop unrelated fixtures ----------------------------
test('AE-06: a throwing mixed-text fixture is isolated; every unrelated fixture is still created and reported', () => {
  const r = runBuilder({ failOnText: '日本語 ABC' });
  assert.equal(r.status('F03')[1], 'NOT ACCEPTED');
  assert.match(r.status('F03')[2], /FAILED/);
  for (const id of ['F01', 'F02', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'L01']) {
    assert.equal(r.status(id)[1], 'ACCEPTED', id + '\n' + r.text);
  }
  assert.equal(r.main.layersCreated.length, 11);
});

test('AE-06: addText("") returning no layer (the recorded F06 host anomaly) no longer aborts the builder', () => {
  const r = runBuilder({ emptyReturnsUndefined: true });
  assert.equal(r.status('F06')[1], 'NOT ACCEPTED');
  assert.match(r.status('F06')[2], /addText returned no layer/);
  for (const id of ['F07', 'F08', 'F09', 'F10', 'F11', 'F12']) { assert.equal(r.status(id)[1], 'ACCEPTED', id); }
  assert.equal(r.main.opened, true);
});

test('AE-06: the step runner records failures and keeps running', () => {
  const api = loadHelpers();
  const runner = api.createStepRunner();
  runner.run('A', () => { throw new Error('boom'); });
  runner.run('B', () => {});
  assert.equal(runner.accepted('A'), false);
  assert.equal(runner.accepted('B'), true);
  assert.match(runner.report().join('\n'), /A: NOT ACCEPTED - FAILED: Error: boom/);
});

test('AE-06: a fixture needing readback is not accepted without a confirmation', () => {
  const api = loadHelpers();
  const runner = api.createStepRunner();
  runner.run('X', () => {}, true);
  runner.run('Y', () => runner.confirm('font', { confirmed: true }), true);
  runner.run('Z', () => runner.confirm('font', { confirmed: false, reason: 'differs', requested: 'a', observed: 'b' }), true);
  assert.deepEqual([runner.accepted('X'), runner.accepted('Y'), runner.accepted('Z')], [false, true, false]);
});

test('the builder keeps ES3-compatible syntax and its disposable-project warning', () => {
  assert.ok(!/=>|\blet\b|\bconst\b|`/.test(SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/"(?:[^"\\\n]|\\.)*"/g, '""').replace(/'(?:[^'\\\n]|\\.)*'/g, "''")));
  assert.match(SOURCE, /WILL MODIFY the current AE project/);
});
