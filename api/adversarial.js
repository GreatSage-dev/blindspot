import { sendJson, parseJsonBody } from './_utils.js';
import { testAdversarialCliche } from '../src/engine/blindspot.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Qloo-Api-Key, X-Api-Key');
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    const result = testAdversarialCliche(body.clicheId, body.caseLabel);
    return sendJson(res, 200, { ok: true, result });
  } catch (err) {
    return sendJson(res, 400, { ok: false, error: err.message || 'Adversarial check failed' });
  }
}
