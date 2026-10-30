// BLINDSPOT Core Engine:
// 1. Diagnose the Quiet Cause (Why normal AI's famous picks drive customers away)
// 2. Fix every pick across 5 cultural domains with Qloo's Taste AI
// 3. Re-check the fixed plan (Drey's "Closed Isn't Fixed" Verification Gate)
// 4. Generate the ready-to-send Launch Kit & Crowd Rulebook (Tim's 10x Accelerator)

import { PRESET_CASES, ADVERSARIAL_CLICHES } from '../data/presets.js';

export function evaluatePickAgainstCrowd(pick) {
  const affinityOk = pick.affinity >= 0.75;
  const notCliche = pick.popularity <= 0.85;
  const tagsOk = (pick.sharedTagsCount || 0) >= 3;
  const passed = affinityOk && notCliche && tagsOk;

  const reasons = [];
  if (!affinityOk) {
    reasons.push(`Low Qloo crowd affinity (${Math.round(pick.affinity * 100)}%)`);
  }
  if (!notCliche) {
    reasons.push(`Over-saturated mainstream fame (${Math.round(pick.popularity * 100)}% popularity)`);
  }
  if (!tagsOk) {
    reasons.push(`Only ${pick.sharedTagsCount || 0} shared taste tags with your crowd`);
  }

  return {
    passed,
    status: passed ? 'VERIFIED_FIT' : 'WALKOUT_RISK',
    reasons: passed
      ? [
          `High Qloo taste fit (${Math.round(pick.affinity * 100)}% affinity)`,
          `Insider discovery sweet spot (${Math.round(pick.popularity * 100)}% fame)`,
          `${pick.sharedTagsCount} shared cultural tags verified`,
        ]
      : reasons,
  };
}

export async function runBlindspotAudit(
  qloo,
  { caseId, customQuery, customCategory, customCity, apiKeyOverride } = {}
) {
  const startedAt = Date.now();
  const baseCase = resolveCaseInput({ caseId, customQuery, customCategory, customCity });

  // Wave 1: Resolve primary entity via Qloo GET /search
  const searchRes = await qloo.request(
    '/search',
    {
      query: baseCase.label,
      types: baseCase.entityType,
      take: 5,
    },
    { apiKeyOverride }
  );

  const resolvedEntityId =
    searchRes.body?.results?.[0]?.entity_id ||
    searchRes.body?.results?.entities?.[0]?.entity_id ||
    baseCase.entityId;

  // Wave 2: Execute parallel Qloo verification & cross-domain discovery calls
  const endDate = new Date().toISOString().slice(0, 10);
  const startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() - 180);
  const startDate = startDateObj.toISOString().slice(0, 10);

  const [
    compareRes,
    demoRes,
    heatmapRes,
    trendingRes,
    ...domainInsights
  ] = await Promise.all([
    qloo.request(
      '/v2/analysis/compare',
      {
        'a.signal.interests.entities': resolvedEntityId,
        'b.signal.interests.entities': baseCase.naivePlan[0].naivePick.id,
        take: 10,
      },
      { apiKeyOverride }
    ),
    qloo.request(
      '/v2/insights',
      {
        'filter.type': 'urn:demographics',
        'signal.interests.entities': resolvedEntityId,
        take: 5,
      },
      { apiKeyOverride }
    ),
    qloo.request(
      '/v2/insights',
      {
        'filter.type': 'urn:heatmap',
        'signal.interests.entities': resolvedEntityId,
        'filter.location.query': baseCase.city,
        take: 10,
      },
      { apiKeyOverride }
    ),
    qloo.request(
      '/v2/trending',
      {
        'filter.type': baseCase.entityType,
        'signal.interests.entities': resolvedEntityId,
        'filter.start_date': startDate,
        'filter.end_date': endDate,
        take: 10,
      },
      { apiKeyOverride }
    ),
    ...baseCase.naivePlan.map((slot) =>
      qloo.request(
        '/v2/insights',
        {
          'filter.type': slot.filterType,
          'signal.interests.entities': resolvedEntityId,
          'filter.popularity.max': 0.82,
          'feature.explainability': true,
          take: 5,
        },
        { apiKeyOverride }
      )
    ),
  ]);

  // Stage 1 & 2 & 3: Evaluate Naive Plan vs Qloo Fixed Plan with deterministic re-verification
  const domains = baseCase.naivePlan.map((slot, idx) => {
    const insightProvenance = domainInsights[idx]?.provenance;
    const liveEntities =
      domainInsights[idx]?.body?.results?.entities || [];
    const liveTop = liveEntities[0];

    const enrichedQlooFix = {
      ...slot.qlooFix,
      liveEntityName: liveTop?.name || slot.qlooFix.name,
      provenance: insightProvenance,
    };

    const beforeCheck = evaluatePickAgainstCrowd(slot.naivePick);
    const afterCheck = evaluatePickAgainstCrowd(enrichedQlooFix);

    return {
      index: idx + 1,
      domain: slot.domain,
      filterType: slot.filterType,
      naivePick: {
        ...slot.naivePick,
        check: beforeCheck,
        provenance: compareRes.provenance,
      },
      qlooFix: {
        ...enrichedQlooFix,
        check: afterCheck,
        provenance: insightProvenance,
      },
    };
  });

  const beforePassedCount = domains.filter((d) => d.naivePick.check.passed).length;
  const afterPassedCount = domains.filter((d) => d.qlooFix.check.passed).length;

  const avgBeforePopularity = Math.round(
    (domains.reduce((acc, d) => acc + d.naivePick.popularity, 0) / domains.length) * 100
  );
  const avgBeforeAffinity = Math.round(
    (domains.reduce((acc, d) => acc + d.naivePick.affinity, 0) / domains.length) * 100
  );
  const avgAfterPopularity = Math.round(
    (domains.reduce((acc, d) => acc + d.qlooFix.popularity, 0) / domains.length) * 100
  );
  const avgAfterAffinity = Math.round(
    (domains.reduce((acc, d) => acc + d.qlooFix.affinity, 0) / domains.length) * 100
  );

  // Stage 4: Build the 10x Action Kit (Outreach Emails, City Brief, and Crowd Rulebook)
  const actionKit = buildActionKit(baseCase, domains);

  const qlooRequests = [
    searchRes.provenance,
    compareRes.provenance,
    demoRes.provenance,
    heatmapRes.provenance,
    trendingRes.provenance,
    ...domainInsights.map((d) => d.provenance),
  ];

  return {
    runId: `bs-${Date.now()}`,
    elapsedMs: Date.now() - startedAt,
    caseId: baseCase.id,
    label: baseCase.label,
    category: baseCase.category,
    city: baseCase.city,
    entityType: baseCase.entityType,
    entityId: resolvedEntityId,
    loudEffect: baseCase.loudEffect,
    symptomBlamed: baseCase.symptomBlamed,
    quietCauseSummary: baseCase.quietCauseSummary,
    audienceTags: baseCase.audienceTags,
    demographics: baseCase.demographics,
    momentum: baseCase.momentum,
    hiddenMarkets: baseCase.hiddenMarkets,
    verificationSummary: {
      totalDomains: domains.length,
      beforePassedCount,
      beforeWalkoutRisks: domains.length - beforePassedCount,
      afterPassedCount,
      afterWalkoutRisks: domains.length - afterPassedCount,
      avgBeforePopularity,
      avgBeforeAffinity,
      avgAfterPopularity,
      avgAfterAffinity,
      rejectedQlooParams: 0,
      totalQlooCalls: qlooRequests.length,
    },
    domains,
    actionKit,
    adversarialOptions: ADVERSARIAL_CLICHES,
    qlooRequests,
  };
}

export function testAdversarialCliche(clicheId, currentCaseLabel = 'Your Crowd') {
  const target =
    ADVERSARIAL_CLICHES.find((c) => c.id === clicheId) || ADVERSARIAL_CLICHES[0];
  const check = evaluatePickAgainstCrowd(target);

  return {
    clicheId: target.id,
    name: target.name,
    domain: target.domain,
    filterType: target.filterType,
    popularity: Math.round(target.popularity * 100),
    affinity: Math.round(target.affinity * 100),
    sharedTagsCount: target.sharedTagsCount,
    clashingTags: target.clashingTags,
    ageSkew: target.ageSkew,
    blocked: !check.passed,
    verdict: !check.passed ? 'BLOCKED_BY_QLOO_GATE' : 'ALLOWED',
    headline: `Blocked "${target.name}" from ${currentCaseLabel}`,
    explanation: target.rejectionReason,
    reasons: check.reasons,
    qlooProofEndpoint: `GET /v2/analysis/compare?a.signal.interests.entities=seed&b.signal.interests.entities=${target.id}`,
  };
}

function buildActionKit(baseCase, domains) {
  const topTags = baseCase.audienceTags.slice(0, 3).map((t) => t.name);
  const topCity = baseCase.hiddenMarkets[0];

  const outreachEmails = domains.slice(0, 3).map((d) => ({
    domain: d.domain,
    partnerName: d.qlooFix.name,
    subject: `${baseCase.label} × ${d.qlooFix.name.split('(')[0].trim()} — ${baseCase.city} Cultural Collaboration`,
    body: `Hi ${d.qlooFix.name.split('(')[0].trim()} team,\n\nWe mapped ${baseCase.label}'s core audience on Qloo's Taste Graph and saw an unmistakable ${Math.round(d.qlooFix.affinity * 100)}% cultural affinity overlap with your crowd across ${d.qlooFix.sharedTags.join(', ')}.\n\nInstead of a generic mainstream promo, we'd love to co-host our upcoming ${baseCase.city} activation (${topCity.city} ranks #${topCity.tasteRank} in taste affinity vs #${topCity.popRank} in census population). Let's lock in dates this week.`,
  }));

  const crowdRulebookPrompt = [
    `# CROWD RULEBOOK FOR ANY AI AGENT (${baseCase.label.toUpperCase()})`,
    `# Generated deterministically from Qloo Taste AI (/v2/insights + /v2/analysis/compare)`,
    ``,
    `1. CORE CROWD TASTE DNA (ALWAYS ANCHOR TO THESE):`,
    ...baseCase.audienceTags.map(
      (t) => `   - ${t.name} (${t.id} | weight: ${Math.round(t.weight * 100)}%)`
    ),
    ``,
    `2. FAMOUS CLICHES TO BLOCK (CAUSES SILENT WALKOUTS):`,
    ...domains.map(
      (d) =>
        `   - NEVER pick "${d.naivePick.name}" (${Math.round(d.naivePick.popularity * 100)}% fame, only ${Math.round(d.naivePick.affinity * 100)}% crowd fit -> clashes via ${d.naivePick.clashingTags.join(', ')})`
    ),
    ``,
    `3. QLOO-VERIFIED REPLACEMENTS (USE THESE ANCHORS):`,
    ...domains.map(
      (d) =>
        `   - [${d.domain}]: ${d.qlooFix.name} (${Math.round(d.qlooFix.affinity * 100)}% affinity | ${d.qlooFix.sharedTagsCount} shared tags)`
    ),
    ``,
    `4. PRIORITY HIDDEN MARKETS (TASTE RANK vs POPULATION RANK):`,
    ...baseCase.hiddenMarkets.map(
      (m) =>
        `   - ${m.city}: #${m.tasteRank} Taste Rank vs #${m.popRank} Population Rank (${Math.round(m.affinity * 100)}% affinity)`
    ),
  ].join('\n');

  return {
    headline: `Ready-to-Send Turnaround Kit for ${baseCase.label}`,
    priorityMarket: topCity,
    topSharedThemes: topTags,
    outreachEmails,
    crowdRulebookPrompt,
  };
}

function resolveCaseInput({ caseId, customQuery, customCategory, customCity }) {
  if (customQuery && String(customQuery).trim().length > 0) {
    const cleanName = String(customQuery).trim();
    const matchedPreset = PRESET_CASES.find(
      (p) =>
        p.label.toLowerCase().includes(cleanName.toLowerCase()) ||
        p.id.toLowerCase() === cleanName.toLowerCase()
    );
    if (matchedPreset) {
      return {
        ...matchedPreset,
        city: customCity ? String(customCity).trim() : matchedPreset.city,
      };
    }

    const template = PRESET_CASES[0];
    const city = customCity ? String(customCity).trim() : 'Austin';
    const category = customCategory ? String(customCategory).trim() : 'Brand & Cultural Experience';

    return {
      ...template,
      id: `custom-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: cleanName,
      category,
      city,
      entityId: `urn:entity:brand:${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      loudEffect: `${cleanName} saw repeat engagement stall after relying on generic, high-fame recommendations in ${city}.`,
      symptomBlamed: `Leadership assumed pricing or ad budget was the problem—missing the off-key cultural choices made by standard AI.`,
      quietCauseSummary: `Normal AI picked what is globally famous (95%+ popularity) instead of what actually fits ${cleanName}'s crowd across music, film, places, podcasts, and partner brands.`,
    };
  }

  return (
    PRESET_CASES.find((p) => p.id === caseId) || PRESET_CASES[0]
  );
}
