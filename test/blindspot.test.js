// Deterministic Verification Suite for BLINDSPOT (Node Test Runner)
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQlooRequest } from '../src/qloo/validator.js';
import { QlooClient, QlooAuthError } from '../src/qloo/client.js';
import {
  runBlindspotAudit,
  testAdversarialCliche,
  evaluatePickAgainstCrowd,
} from '../src/engine/blindspot.js';
import { createBlindspotServer } from '../server.js';

test('Qloo Parameter Validator accepts valid hackathon endpoints and filter.types', () => {
  const checkInsights = validateQlooRequest('/v2/insights', {
    'filter.type': 'urn:entity:artist',
    'signal.interests.entities': 'urn:entity:place:standard-high-line-nyc',
    'filter.popularity.max': 0.8,
    'feature.explainability': true,
    take: 5,
  });
  assert.equal(checkInsights.ok, true);
  assert.equal(checkInsights.problems.length, 0);

  const checkCompare = validateQlooRequest('/v2/analysis/compare', {
    'a.signal.interests.entities': 'urn:entity:a',
    'b.signal.interests.entities': 'urn:entity:b',
    take: 10,
  });
  assert.equal(checkCompare.ok, true);
});

test('Qloo Parameter Validator strictly blocks forbidden legacy paths and undocumented params', () => {
  const legacyCheck = validateQlooRequest('/v1/recs', { take: 5 });
  assert.equal(legacyCheck.ok, false);
  assert.match(legacyCheck.problems[0], /forbidden/i);

  const badParamCheck = validateQlooRequest('/v2/insights', {
    'filter.type': 'urn:entity:artist',
    'signal.interests.entities': 'urn:entity:a',
    'invented.fake.param': '123',
  });
  assert.equal(badParamCheck.ok, false);
  assert.match(badParamCheck.problems.join(' '), /not documented/i);
});

test('runBlindspotAudit diagnoses all 5 domains, fixes walkout risks, and records 0 rejected params', async () => {
  const client = new QlooClient({ apiKey: '' });
  const audit = await runBlindspotAudit(client, { caseId: 'standard-highline' });

  assert.equal(audit.caseId, 'standard-highline');
  assert.equal(audit.domains.length, 5);
  assert.equal(audit.verificationSummary.beforePassedCount, 0);
  assert.equal(audit.verificationSummary.afterPassedCount, 5);
  assert.equal(audit.verificationSummary.rejectedQlooParams, 0);
  assert.equal(audit.qlooRequests.length, 10);
  assert.ok(audit.actionKit.outreachEmails.length >= 3);
  assert.match(audit.actionKit.crowdRulebookPrompt, /CROWD RULEBOOK/i);
});

test('runBlindspotAudit strictly enforces Zero-Mock Mandate and refuses unauthenticated custom queries', async () => {
  const client = new QlooClient({ apiKey: '' });

  // 1. Unauthenticated custom query must fail closed with QLOO_AUTH
  await assert.rejects(
    async () => {
      await runBlindspotAudit(client, {
        customQuery: 'Unknown Independent Pop-Up Brand',
        customCity: 'Seattle',
      });
    },
    (err) => {
      assert.equal(err.code, 'QLOO_AUTH');
      assert.equal(err.layer, 'qloo');
      assert.equal(err.retryable, false);
      return true;
    }
  );

  // 2. Querying a known benchmark preset by name resolves to verified benchmark data
  const presetAudit = await runBlindspotAudit(client, {
    customQuery: 'The Standard, High Line',
    customCity: 'New York',
  });
  assert.equal(presetAudit.caseId, 'standard-highline');
  assert.equal(presetAudit.label, 'The Standard, High Line');
  assert.equal(presetAudit.verificationSummary.afterPassedCount, 5);
  assert.equal(presetAudit.verificationSummary.rejectedQlooParams, 0);
});

test('Adversarial Cliché Gate blocks 99% popularity mismatches with Qloo proof', () => {
  const res = testAdversarialCliche('cliche-drake-stadium', 'The Standard, High Line');
  assert.equal(res.blocked, true);
  assert.equal(res.verdict, 'BLOCKED_BY_QLOO_GATE');
  assert.ok(res.popularity >= 95);
  assert.ok(res.affinity <= 25);

  const directCheck = evaluatePickAgainstCrowd({
    popularity: 0.99,
    affinity: 0.14,
    sharedTagsCount: 0,
  });
  assert.equal(directCheck.passed, false);
  assert.equal(directCheck.status, 'WALKOUT_RISK');
});

test('HTTP Server serves /api/health, /api/presets, /api/audit, /api/adversarial, and HTML UI', async () => {
  const server = createBlindspotServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const healthRes = await fetch(`${base}/api/health`);
    assert.equal(healthRes.status, 200);
    const health = await healthRes.json();
    assert.equal(health.ok, true);
    assert.equal(health.qlooStats.rejectedRequests, 0);

    const presetsRes = await fetch(`${base}/api/presets`);
    assert.equal(presetsRes.status, 200);
    const presets = await presetsRes.json();
    assert.equal(presets.presets.length, 3);

    const auditRes = await fetch(`${base}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: 'a24-indie-launch' }),
    });
    assert.equal(auditRes.status, 200);
    const auditBody = await auditRes.json();
    assert.equal(auditBody.ok, true);
    assert.equal(auditBody.audit.verificationSummary.afterPassedCount, 5);

    // Verify unauthenticated custom audit returns 401 QLOO_AUTH
    const unauthRes = await fetch(`${base}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customQuery: 'Unknown Brand X' }),
    });
    assert.equal(unauthRes.status, 401);
    const unauthBody = await unauthRes.json();
    assert.equal(unauthBody.ok, false);
    assert.equal(unauthBody.error.code, 'QLOO_AUTH');

    const advRes = await fetch(`${base}/api/adversarial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clicheId: 'cliche-mrbeast-promo', caseLabel: 'A24' }),
    });
    assert.equal(advRes.status, 200);
    const advBody = await advRes.json();
    assert.equal(advBody.result.blocked, true);

    const htmlRes = await fetch(`${base}/`);
    assert.equal(htmlRes.status, 200);
    const htmlText = await htmlRes.text();
    assert.match(htmlText, /Fame lies/i);

    const appRes = await fetch(`${base}/app`);
    assert.equal(appRes.status, 200);
    const appText = await appRes.text();
    assert.match(appText, /Qloo Taste Turnaround Workbench/i);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
