import { inspect } from './permissions.js';

const args = process.argv.slice(2);
if (args.includes('--help') || args.length === 0) {
  console.log('Usage: node src/cli.js <hook-address> [--dynamic-fee] [--json]\nDynamic fees belong to the pool configuration, not the hook address.');
} else {
  try {
    const allowed = new Set(['--json', '--dynamic-fee']);
    if (args.slice(1).some(arg => !allowed.has(arg))) throw new Error('Unknown argument. Use --help.');
    const result = inspect(args[0], { dynamicFee: args.includes('--dynamic-fee') });
    if (args.includes('--json')) console.log(JSON.stringify(result, null, 2));
    else {
      console.log(`Hook Lens\n${result.address}\nPermission mask: ${result.mask}\n`);
      for (const p of result.enabled) console.log(`• ${p.name}: ${p.explanation}`);
      if (!result.enabled.length) console.log('No callback permissions encoded.');
      console.log(`\nAddress rules: ${result.addressRulesPass ? 'pass' : 'fail'}`);
      for (const problem of result.problems) console.log(`• ${problem}`);
      console.log(`\n${result.limitation}`);
    }
    if (!result.addressRulesPass) process.exitCode = 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
