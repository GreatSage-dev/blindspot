import { sendJson } from './_utils.js';
import { PRESET_CASES, ADVERSARIAL_CLICHES } from '../src/data/presets.js';

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
      presets: PRESET_CASES.map((p) => ({
        id: p.id,
        label: p.label,
        category: p.category,
        city: p.city,
        loudEffect: p.loudEffect,
      })),
      adversarialCliches: ADVERSARIAL_CLICHES,
    });
  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err.message || 'Presets fetch failed' });
  }
}
