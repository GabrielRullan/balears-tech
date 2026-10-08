// tests/run-e2e.mjs
import { buildTestContext } from './test-utils.mjs';
import { runTier1Features } from './tier1.mjs';
import { runTier2Boundaries } from './tier2.mjs';
import { runTier3Interactions } from './tier3.mjs';
import { runTier4Scenarios } from './tier4.mjs';

class TierRunner {
  constructor(name) {
    this.name = name;
    this.passed = 0;
    this.failed = 0;
    this.failures = [];
  }

  test(name, fn) {
    try {
      fn();
      this.passed++;
    } catch (err) {
      this.failed++;
      this.failures.push({ name, error: err });
    }
  }
}

export async function runAllTiers() {
  console.log('='.repeat(72));
  console.log('  BALEARS.TECH — END-TO-END ACCEPTANCE TEST SUITE (TIERS 1-4)');
  console.log('='.repeat(72));
  console.log('');

  const ctx = buildTestContext();
  if (!ctx.distHtml) {
    console.error('ERROR: dist/index.html not found! Please run "npm run build" first.');
    process.exit(1);
  }

  const tier1 = new TierRunner('Tier 1: Feature Inventory (F1-F21)');
  const tier2 = new TierRunner('Tier 2: Boundary & Corner Cases');
  const tier3 = new TierRunner('Tier 3: Pairwise Interactions');
  const tier4 = new TierRunner('Tier 4: Realistic User Scenarios');

  console.log('Running Tier 1 (105 Feature Tests)...');
  runTier1Features(ctx, tier1);

  console.log('Running Tier 2 (105 Boundary Tests)...');
  runTier2Boundaries(ctx, tier2);

  console.log('Running Tier 3 (21 Interaction Tests)...');
  runTier3Interactions(ctx, tier3);

  console.log('Running Tier 4 (10 User Scenarios)...');
  runTier4Scenarios(ctx, tier4);

  const tiers = [tier1, tier2, tier3, tier4];
  const totalPassed = tiers.reduce((acc, t) => acc + t.passed, 0);
  const totalFailed = tiers.reduce((acc, t) => acc + t.failed, 0);
  const totalTests = totalPassed + totalFailed;

  console.log('');
  console.log('='.repeat(72));
  console.log('  TEST EXECUTION SUMMARY');
  console.log('='.repeat(72));
  console.log(
    'Tier'.padEnd(40) +
      'Passed'.padStart(10) +
      'Failed'.padStart(10) +
      'Total'.padStart(10)
  );
  console.log('-'.repeat(72));

  for (const t of tiers) {
    const total = t.passed + t.failed;
    console.log(
      t.name.padEnd(40) +
        String(t.passed).padStart(10) +
        String(t.failed).padStart(10) +
        String(total).padStart(10)
    );
  }

  console.log('-'.repeat(72));
  console.log(
    'TOTAL SUITE'.padEnd(40) +
      String(totalPassed).padStart(10) +
      String(totalFailed).padStart(10) +
      String(totalTests).padStart(10)
  );
  console.log('='.repeat(72));

  if (totalFailed > 0) {
    console.log('');
    console.error(`FAILED: ${totalFailed} tests encountered errors:`);
    for (const t of tiers) {
      if (t.failures.length > 0) {
        console.error(`\n[${t.name}]`);
        for (const f of t.failures) {
          console.error(`  ✖ ${f.name}`);
          console.error(`    ${f.error?.message || f.error}`);
        }
      }
    }
    process.exit(1);
  }

  console.log('\n✔ ALL 241 TESTS PASSED PERFECTLY (100% SUCCESS RATE)\n');
  process.exit(0);
}

runAllTiers();
