import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/api/paymentCheckout.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function setup() {
  const redirects = [], errors = [], stored = new Map();
  const context = { exports: {}, URL, window: { location: { assign: url => redirects.push(url) } }, localStorage: { setItem: (key, value) => stored.set(key, value) } };
  vm.runInNewContext(source, context);
  return { open: data => context.exports.startPaymentCheckout(data, error => errors.push(error)), redirects, errors, stored };
}
test('opens Paystack checkout and saves reference', async () => {
  const app = setup();
  await app.open({ payment_url: 'https://checkout.paystack.com/test', payment_reference: 'reference' });
  assert.deepEqual(app.redirects, ['https://checkout.paystack.com/test']);
  assert.equal(app.stored.get('paystack_reference'), 'reference');
});
test('rejects missing checkout data and untrusted URLs', async () => {
  for (const payment_url of [undefined, 'http://checkout.paystack.com/test', 'https://example.com/test', 'https://checkout.paystack.com.example.com/test', 'javascript:alert(1)']) {
    const app = setup();
    await app.open({ payment_url, payment_reference: 'reference' });
    assert.equal(app.redirects.length, 0);
    assert.equal(app.errors.length, 1);
  }
});
