/**
 * PQ-RDL internal automated evidence report generator.
 *
 * This is not an independent security certificate, audit score, compliance
 * attestation, or production-readiness certification.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { sha256 } from '@noble/hashes/sha2.js';

function runStep(title: string, cmd: string) {
  console.log(`\n▶ ${title}...`);
  execSync(cmd, { stdio: 'inherit' });
  console.log(`  PASS: ${title}`);
}

async function generateReport() {
  console.log('PQ-RDL — INTERNAL AUTOMATED EVIDENCE REPORT');
  console.log('Boundary: repository checks only; no independent audit or production certification.\n');

  let commitSha = 'UNKNOWN';
  try {
    commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {}

  runStep('[1/5] Rust workspace tests', 'cargo test --workspace --all-targets');
  runStep('[2/5] TypeScript type check', 'npx tsc --noEmit');
  runStep('[3/5] Standards conformance/adversarial test suite', 'npx tsx src/crypto/tests/official-nist-vectors.test.ts');
  runStep('[4/5] Standalone cryptographic implementation audit', 'node scripts/audit-crypto.mjs');
  runStep('[5/5] Internal reality checks', 'npx tsx scripts/reality-universal.ts');

  const scorecardPath = path.resolve(process.cwd(), 'reality/URS_SCORECARD.json');
  const scorecard = JSON.parse(fs.readFileSync(scorecardPath, 'utf8'));
  const gatesPassed = Array.isArray(scorecard.results)
    ? scorecard.results.filter((result: any) => result.passed).length
    : 0;
  const gatesTotal = Array.isArray(scorecard.results) ? scorecard.results.length : 0;

  const payload = {
    artifactType: 'INTERNAL_AUTOMATED_EVIDENCE_REPORT',
    protocol: 'PQ-RDL-BLOCKCHAIN',
    commitSha,
    timestamp: new Date().toISOString(),
    internalGateScore: scorecard.u10Score,
    gatesPassed,
    gatesTotal,
    independentSecurityAuditCompleted: false,
    publicTestnetVerified: false,
    mainnetVerified: false,
    productionCertified: false,
    note: 'A SHA-256 digest proves only the integrity of this report payload; it does not certify the security or production readiness of the protocol.',
  };

  const serialized = JSON.stringify(payload, null, 2);
  const reportDigestSha256 = Buffer.from(
    sha256(new TextEncoder().encode(serialized))
  ).toString('hex');

  const fullReport = { ...payload, reportDigestSha256 };
  const reportPath = path.resolve(process.cwd(), 'reality/URS_EVIDENCE_CERTIFICATE.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));

  const docsDir = path.resolve(process.cwd(), 'docs/reality');
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(
    path.join(docsDir, 'URS_EVIDENCE_CERTIFICATE.md'),
    `# PQ-RDL Internal Automated Evidence Report

- **Report digest (SHA-256)**: \`${reportDigestSha256}\`
- **Commit SHA**: \`${commitSha}\`
- **Internal gates passed**: \`${gatesPassed} / ${gatesTotal}\`
- **Independent security audit completed**: \`false\`
- **Public Testnet verified**: \`false\`
- **Mainnet verified**: \`false\`

This file is an integrity-stamped internal CI report, not an independent certificate, security audit, or production attestation.
`
  );

  console.log('\nInternal evidence report generated.');
  console.log(`  Gates: ${gatesPassed}/${gatesTotal}`);
  console.log(`  SHA-256 report digest: ${reportDigestSha256}`);
  console.log('  Independent security audit: NOT COMPLETED');
  console.log('  Public Testnet/Mainnet: NOT VERIFIED');
}

generateReport().catch((error) => {
  console.error('Evidence report generation failed:', error);
  process.exit(1);
});
