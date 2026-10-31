import { sendJson } from './_utils.js';
import { QlooClient } from '../src/qloo/client.js';

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
    return sendJson(res, 200, {
      ok: true,
      service: 'blindspot-qloo',
      version: '1.0.0',
      liveKeyConfigured: qloo ? qloo.hasLiveKey() : false,
      qlooStats: qloo ? qloo.getSummary() : { totalRequests: 0, validRequests: 0 },
    });
  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err.message || 'Health check error' });
  }
}
