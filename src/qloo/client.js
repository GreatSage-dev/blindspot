// Qloo Taste AI Client with Strict Parameter Validation & Request Provenance
// Follows Qloo Hackathon Kit standards: zero silent fallbacks, explicit QLOO_AUTH handling,
// and benchmark fixture reproducibility.

import { validateQlooRequest, QlooParamError } from './validator.js';
import { getBenchmarkFixture } from '../data/benchmark-fixtures.js';

const DEFAULT_BASE_URL =
  process.env.QLOO_BASE_URL || 'https://hackathon.api.qloo.com';

export class QlooAuthError extends Error {
  constructor(
    message = 'Qloo API key required for live queries',
    recovery = "Set QLOO_API_KEY, pass via 'X-Qloo-Api-Key' header, or run 'qloo setup --qloo' using @qloo/qloo-harness."
  ) {
    super(message);
    this.name = 'QlooAuthError';
    this.code = 'QLOO_AUTH';
    this.layer = 'qloo';
    this.retryable = false;
    this.recovery = recovery;
  }
}

export class QlooClient {
  constructor({ apiKey = process.env.QLOO_API_KEY, baseUrl = DEFAULT_BASE_URL } = {}) {
    this.apiKey = apiKey ? String(apiKey).trim() : '';
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.cache = new Map();
    this.stats = {
      totalRequests: 0,
      validRequests: 0,
      rejectedRequests: 0,
      liveCalls: 0,
      fixtureCalls: 0,
      cachedCalls: 0,
      endpointsTouched: new Set(),
      filterTypesTouched: new Set(),
      requestLog: [],
    };
  }

  hasLiveKey() {
    return Boolean(this.apiKey && this.apiKey.length > 8);
  }

  buildQueryString(params = {}) {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue;
      usp.set(k, String(v));
    }
    return usp.toString();
  }

  async request(path, params = {}, { apiKeyOverride } = {}) {
    this.stats.totalRequests += 1;
    const validation = validateQlooRequest(path, params);
    if (!validation.ok) {
      this.stats.rejectedRequests += 1;
      throw new QlooParamError(
        `Invalid Qloo request on ${path}: ${validation.problems.join(' | ')}`,
        validation.problems
      );
    }

    this.stats.validRequests += 1;
    this.stats.endpointsTouched.add(path);
    if (params['filter.type']) {
      this.stats.filterTypesTouched.add(params['filter.type']);
    }

    const qs = this.buildQueryString(params);
    const fullPath = qs ? `${path}?${qs}` : path;
    const startedAt = Date.now();
    const activeKey = apiKeyOverride || this.apiKey;

    // Cache hit
    if (this.cache.has(fullPath)) {
      this.stats.cachedCalls += 1;
      const cached = this.cache.get(fullPath);
      const provenance = {
        method: 'GET',
        path: fullPath,
        endpoint: path,
        filterType: params['filter.type'] || null,
        validated: true,
        rejectedParams: 0,
        mode: cached.mode,
        latencyMs: Date.now() - startedAt,
      };
      this.recordProvenance(provenance);
      return { body: cached.body, provenance };
    }

    // 1. Live API Call via Qloo Gateway
    if (activeKey && activeKey.length > 8) {
      try {
        const res = await fetch(`${this.baseUrl}${fullPath}`, {
          method: 'GET',
          headers: {
            'X-Api-Key': activeKey,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const body = await res.json();
          this.stats.liveCalls += 1;
          const latencyMs = Date.now() - startedAt;
          this.cache.set(fullPath, { body, mode: 'live-qloo-api' });
          const provenance = {
            method: 'GET',
            path: fullPath,
            endpoint: path,
            filterType: params['filter.type'] || null,
            validated: true,
            rejectedParams: 0,
            mode: 'live-qloo-api',
            latencyMs,
          };
          this.recordProvenance(provenance);
          return { body, provenance };
        }

        if (res.status === 401 || res.status === 403) {
          throw new QlooAuthError(
            `Qloo API key authentication failed (${res.status} Unauthorized).`,
            "Please check that your Qloo API key is valid on hackathon.api.qloo.com or run 'qloo setup --qloo'."
          );
        }

        if (res.status === 429) {
          throw new Error('Qloo API rate limit exceeded. Please throttle requests.');
        }

        throw new Error(`Qloo API HTTP error ${res.status}: ${res.statusText}`);
      } catch (err) {
        if (err instanceof QlooAuthError) throw err;
        // If live API is unreachable or returned network error, only allow verified preset benchmarks
        if (!this.isPresetBenchmarkQuery(params)) {
          throw err;
        }
      }
    }

    // 2. Verified Offline Benchmark Mode
    // Check if this matches one of the 3 verified benchmark dossiers
    if (this.isPresetBenchmarkQuery(params)) {
      this.stats.fixtureCalls += 1;
      const body = getBenchmarkFixture(path, params);
      const latencyMs = Math.max(1, Date.now() - startedAt);
      const provenance = {
        method: 'GET',
        path: fullPath,
        endpoint: path,
        filterType: params['filter.type'] || null,
        validated: true,
        rejectedParams: 0,
        mode: 'benchmark-fixture',
        latencyMs,
      };
      this.cache.set(fullPath, { body, mode: 'benchmark-fixture' });
      this.recordProvenance(provenance);
      return { body, provenance };
    }

    // 3. Custom Query without an API Key -> Fail Closed with standard QLOO_AUTH
    throw new QlooAuthError(
      'Custom live queries require a valid Qloo API key.',
      "Provide your key via the 'X-Qloo-Api-Key' header, set QLOO_API_KEY in your environment, or configure @qloo/qloo-harness with 'qloo setup --qloo'."
    );
  }

  isPresetBenchmarkQuery(params = {}) {
    const text = (
      String(params.query || '') +
      ' ' +
      String(params['a.signal.interests.entities'] || '') +
      ' ' +
      String(params['b.signal.interests.entities'] || '') +
      ' ' +
      String(params['signal.interests.entities'] || '')
    ).toLowerCase();

    return (
      text.includes('standard') ||
      text.includes('highline') ||
      text.includes('high-line') ||
      text.includes('a24') ||
      text.includes('liquid') ||
      text.includes('death') ||
      text.trim().length === 0
    );
  }

  recordProvenance(entry) {
    this.stats.requestLog.push(entry);
    if (this.stats.requestLog.length > 120) {
      this.stats.requestLog.shift();
    }
  }

  getSummary() {
    return {
      totalRequests: this.stats.totalRequests,
      validRequests: this.stats.validRequests,
      rejectedRequests: this.stats.rejectedRequests,
      liveCalls: this.stats.liveCalls,
      fixtureCalls: this.stats.fixtureCalls,
      cachedCalls: this.stats.cachedCalls,
      endpointsTouched: Array.from(this.stats.endpointsTouched),
      filterTypesTouched: Array.from(this.stats.filterTypesTouched),
      recentRequests: this.stats.requestLog.slice(-12),
    };
  }
}
