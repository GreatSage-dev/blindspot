import { sendJson, parseJsonBody } from './_utils.js';
import { validateQlooRequest } from '../src/qloo/validator.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Qloo-Api-Key, X-Api-Key');
    return res.end();
  }

  try {
    const body = req.method === 'POST' ? await parseJsonBody(req) : {};
    const check = validateQlooRequest(body.path || '/v2/insights', body.params || {});
    return sendJson(res, 200, check);
  } catch (err) {
    return sendJson(res, 400, { ok: false, problems: [err.message] });
  }
}
