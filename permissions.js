export const permissions = [
  [13, 'beforeInitialize', 'Runs before a pool is created.'],
  [12, 'afterInitialize', 'Runs after a pool is created.'],
  [11, 'beforeAddLiquidity', 'Runs before liquidity is added.'],
  [10, 'afterAddLiquidity', 'Runs after liquidity is added.'],
  [9, 'beforeRemoveLiquidity', 'Runs before liquidity is removed.'],
  [8, 'afterRemoveLiquidity', 'Runs after liquidity is removed.'],
  [7, 'beforeSwap', 'Runs before a trade.'],
  [6, 'afterSwap', 'Runs after a trade.'],
  [5, 'beforeDonate', 'Runs before a donation to liquidity providers.'],
  [4, 'afterDonate', 'Runs after a donation to liquidity providers.'],
  [3, 'beforeSwapReturnDelta', 'Can return accounting adjustments before a trade.'],
  [2, 'afterSwapReturnDelta', 'Can return accounting adjustments after a trade.'],
  [1, 'afterAddLiquidityReturnDelta', 'Can return accounting adjustments after liquidity is added.'],
  [0, 'afterRemoveLiquidityReturnDelta', 'Can return accounting adjustments after liquidity is removed.']
];

export function inspect(address, { dynamicFee = false } = {}) {
  if (typeof address !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error('Enter an EVM address: 0x followed by exactly 40 hexadecimal characters.');
  }
  const value = BigInt(address);
  const mask = Number(value & 0x3fffn);
  const enabled = permissions.filter(([bit]) => (mask & (1 << bit)) !== 0)
    .map(([bit, name, explanation]) => ({ bit, name, explanation }));
  const problems = [];
  for (const [delta, action] of [[3, 7], [2, 6], [1, 10], [0, 8]]) {
    if ((mask & (1 << delta)) && !(mask & (1 << action))) {
      problems.push(`${permissions.find(([bit]) => bit === delta)[1]} requires ${permissions.find(([bit]) => bit === action)[1]}.`);
    }
  }
  if (value === 0n && dynamicFee) problems.push('A pool with no hook cannot use the dynamic-fee flag.');
  if (value !== 0n && mask === 0 && !dynamicFee) problems.push('A nonzero hook needs at least one permission or a dynamic-fee pool.');
  return {
    address, mask: '0x' + mask.toString(16).padStart(4, '0'), dynamicFee,
    enabled, addressRulesPass: problems.length === 0, problems,
    limitation: 'Address rules only. No checksum, deployed code, pool configuration, audit, ownership, fees or safety verified.'
  };
}
