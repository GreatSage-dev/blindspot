import { sendJson, parseJsonBody } from './_utils.js';
import { QlooClient, QlooAuthError } from '../src/qloo/client.js';
import { runBlindspotAudit } from '../src/engine/blindspot.js';

let qloo;
try {
  qloo = new QlooClient();
} catch (_e) {
  qloo = null;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Qloo-Api-Key, X-Api-Key');
    return res.end();
  }

  try {
    let body = {};
    if (req.method === 'POST') {
      body = await parseJsonBody(req);
    } else {
      const parsedUrl = new URL(req.url || '/', 'http://localhost');
      body = Object.fromEntries(parsedUrl.searchParams.entries());
    }

    const headers = req.headers || {};
    const apiKeyOverride =
      headers['x-qloo-api-key'] ||
      headers['x-api-key'] ||
      body.apiKey ||
      undefined;

    if (!qloo) qloo = new QlooClient();

    const audit = await runBlindspotAudit(qloo, {
      caseId: body.caseId,
      customQuery: body.customQuery,
      customCategory: body.customCategory,
      customCity: body.customCity,
      apiKeyOverride,
    });

    return sendJson(res, 200, {
      ok: true,
      audit,
      qlooStats: qloo.getSummary(),
    });
  } catch (err) {
    if (err instanceof QlooAuthError || err.name === 'QlooAuthError' || err.code === 'QLOO_AUTH') {
      return sendJson(res, 401, {
        ok: false,
        status: 'error',
        error: {
          code: err.code || 'QLOO_AUTH',
          layer: 'qloo',
          retryable: false,
          message: err.message,
          recovery: err.recovery || "Set QLOO_API_KEY or run 'qloo setup --qloo'.",
        },
      });
    }
    return sendJson(res, 400, {
      ok: false,
      error: err.message || 'Audit execution failed',
    });
  }
}
