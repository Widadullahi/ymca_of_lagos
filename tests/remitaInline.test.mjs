import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/api/remitaInline.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function fixture() {
  const scripts = [];
  const redirects = [];
  const timers = new Map();
  let config;
  let id = 0;
  const window = {
    location: { assign: url => redirects.push(url) },
    setTimeout: callback => { timers.set(++id, callback); return id; },
    clearTimeout: timer => timers.delete(timer),
  };
  const document = {
    getElementById: name => scripts.find(script => !script.removed && script.id === name),
    createElement: () => ({ remove() { this.removed = true; } }),
    body: { appendChild: script => scripts.push(script) },
  };
  const context = { exports: {}, window, document, URL, console };
  vm.runInNewContext(source, context);
  return {
    open: context.exports.openRemitaInlinePayment, scripts, redirects, timers,
    get config() { return config; },
    loaded() {
      window.RmPaymentEngine = { init: options => { config = options; return { showPaymentWidget() {} }; } };
      scripts.at(-1).onload();
    },
  };
}

test('a failed script is removed and a new attempt downloads it again', async () => {
  const f = fixture();
  const first = f.open({ rrr: '123' });
  f.scripts[0].onerror();
  await assert.rejects(first, /Unable to load/);
  assert.equal(f.scripts[0].removed, true);
  const retry = f.open({ rrr: '123' });
  assert.equal(f.scripts.length, 2);
  f.loaded();
  await retry;
});

test('concurrent callers share the script and loading times out cleanly', async () => {
  const f = fixture();
  const first = f.open({ rrr: '123' });
  const second = f.open({ rrr: '456' });
  assert.equal(f.scripts.length, 1);
  [...f.timers.values()][0]();
  await assert.rejects(first, /Unable to load/);
  await assert.rejects(second, /Unable to load/);
  const retry = f.open({ rrr: '123' });
  f.loaded();
  await retry;
});

test('only success redirects; cancellation stays put and errors are reported', async () => {
  const f = fixture();
  const errors = [];
  const opening = f.open({ rrr: '123', onError: message => errors.push(message), inlineConfig: { extendedData: { customFields: [{ name: 'rrr', value: 'stale' }, { name: 'other', value: 'keep' }] } } });
  f.loaded();
  await opening;
  assert.equal(f.config.extendedData.customFields.filter(field => field.name === 'rrr').length, 1);
  assert.equal(f.config.extendedData.customFields.find(field => field.name === 'rrr').value, '123');
  f.config.onClose();
  f.config.onError();
  assert.equal(f.redirects.length, 0);
  assert.equal(errors.length, 1);
  f.config.onSuccess();
  assert.equal(f.redirects[0], '/payment?rrr=123');
});
