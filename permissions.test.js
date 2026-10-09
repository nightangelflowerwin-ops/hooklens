import test from 'node:test';
import assert from 'node:assert/strict';
import { inspect } from './permissions.js';
const addr = mask => '0x' + (0x10000n + BigInt(mask)).toString(16).padStart(40, '0');

test('Hookr documented mask enables the expected six permissions', () => {
  const result = inspect('0xb914f955294799de4b891bd2EA8AF628Fa1c68CC');
  assert.equal(result.mask, '0x28cc');
  assert.deepEqual(result.enabled.map(p => p.name), ['beforeInitialize', 'beforeAddLiquidity', 'beforeSwap', 'afterSwap', 'beforeSwapReturnDelta', 'afterSwapReturnDelta']);
  assert.equal(result.addressRulesPass, true);
});
test('every mask matches v4 address dependency rules with and without dynamic fees', () => {
  for (let mask = 0; mask < 16384; mask++) {
    const dependenciesPass = !(mask & 8) || !!(mask & 128);
    const restPass = (!(mask & 4) || !!(mask & 64)) && (!(mask & 2) || !!(mask & 1024)) && (!(mask & 1) || !!(mask & 256));
    for (const dynamicFee of [false, true]) {
      assert.equal(inspect(addr(mask), { dynamicFee }).addressRulesPass, dependenciesPass && restPass && (mask !== 0 || dynamicFee));
    }
  }
});
test('zero hook depends on pool fee and malformed addresses are rejected', () => {
  const zero = '0x' + '0'.repeat(40);
  assert.equal(inspect(zero).addressRulesPass, true);
  assert.equal(inspect(zero, { dynamicFee: true }).addressRulesPass, false);
  for (const bad of ['', '0x123', '0x' + 'g'.repeat(40), null]) assert.throws(() => inspect(bad));
});

