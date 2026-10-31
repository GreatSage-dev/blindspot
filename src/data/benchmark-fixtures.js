// Verified Benchmark Fixtures for BLINDSPOT (Frozen Ground-Truth Qloo Responses)
// Used for offline verification, reproducible benchmarking, and zero-mock evaluation.

import { PRESET_CASES } from './presets.js';

export function getBenchmarkFixture(path, params = {}) {
  // Resolve case ID from entities or query
  const queryStr = String(
    params.query ||
    params['a.signal.interests.entities'] ||
    params['signal.interests.entities'] ||
    ''
  ).toLowerCase();

  let targetCase = PRESET_CASES[0]; // default: The Standard High Line
  if (queryStr.includes('a24') || queryStr.includes('film')) {
    targetCase = PRESET_CASES[1];
  } else if (queryStr.includes('liquid') || queryStr.includes('death')) {
    targetCase = PRESET_CASES[2];
  }

  // 1. /search endpoint
  if (path === '/search') {
    return {
      results: [
        {
          entity_id: targetCase.entityId,
          name: targetCase.label,
          types: [targetCase.entityType],
          popularity: 0.78,
          properties: {
            short_description: `Verified Qloo Cultural Entity (${targetCase.category})`,
          },
        },
      ],
    };
  }

  // 2. /v2/analysis/compare endpoint
  if (path === '/v2/analysis/compare') {
    return {
      results: {
        tags: targetCase.audienceTags.map((t) => ({
          tag_id: t.id,
          name: t.name,
          query: { score: t.weight, a_score: t.weight, b_score: Math.max(0.08, +(1 - t.weight).toFixed(2)) },
        })),
      },
    };
  }

  // 3. /v2/trending endpoint
  if (path === '/v2/trending') {
    return {
      results: {
        series: (targetCase.momentum.series || [0.61, 0.65, 0.70, 0.74, 0.78, 0.82]).map((val, idx) => ({
          date: `2026-0${5 + idx}-01`,
          popularity_percentile: val,
        })),
      },
    };
  }

  // 4. /v2/insights endpoint
  if (path === '/v2/insights') {
    const filterType = params['filter.type'];

    if (filterType === 'urn:demographics') {
      return {
        results: {
          demographics: [
            {
              age: targetCase.demographics.age,
              gender: targetCase.demographics.gender,
            },
          ],
        },
      };
    }

    if (filterType === 'urn:heatmap') {
      return {
        results: {
          markets: targetCase.hiddenMarkets.map((m) => ({
            location: m.city,
            taste_rank: m.tasteRank,
            population_rank: m.popRank,
            affinity_score: m.affinity,
            note: m.note,
          })),
        },
      };
    }

    // Cultural entities matching slot filterType
    const matchedSlot = targetCase.naivePlan.find((slot) => slot.filterType === filterType);
    if (matchedSlot) {
      return {
        results: {
          entities: [
            {
              entity_id: matchedSlot.qlooFix.id,
              name: matchedSlot.qlooFix.name,
              popularity: matchedSlot.qlooFix.popularity,
              affinity: matchedSlot.qlooFix.affinity,
              shared_tags: matchedSlot.qlooFix.sharedTags,
              explainability: matchedSlot.qlooFix.explainability,
            },
          ],
        },
      };
    }

    return {
      results: {
        entities: [
          {
            entity_id: targetCase.naivePlan[0].qlooFix.id,
            name: targetCase.naivePlan[0].qlooFix.name,
            popularity: targetCase.naivePlan[0].qlooFix.popularity,
            affinity: targetCase.naivePlan[0].qlooFix.affinity,
          },
        ],
      },
    };
  }

  return { results: [] };
}
