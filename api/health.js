import { sendJson } from './_utils.js';
import { QlooClient } from '../src/qloo/client.js';

const qloo = new QlooClient();

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Qloo-Api-Key, X-Api-Key');
    return res.end();
  }

  return sendJson(res, 200, {
    ok: true,
    service: 'blindspot-qloo',
    version: '1.0.0',
    liveKeyConfigured: qloo.hasLiveKey(),
    qlooStats: qloo.getSummary(),
  });
}
