// BLINDSPOT HTTP Server & API Router
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QlooClient, QlooAuthError } from './src/qloo/client.js';
import { validateQlooRequest } from './src/qloo/validator.js';
import { PRESET_CASES, ADVERSARIAL_CLICHES } from './src/data/presets.js';
import { runBlindspotAudit, testAdversarialCliche } from './src/engine/blindspot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

export const qlooClient = new QlooClient();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Qloo-Api-Key, X-Api-Key',
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Qloo-Api-Key, X-Api-Key',
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      service: 'blindspot-qloo',
      version: '1.0.0',
      liveKeyConfigured: qlooClient.hasLiveKey(),
      qlooStats: qlooClient.getSummary(),
    });
  }

  if (pathname === '/api/presets' && req.method === 'GET') {
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
  }

  if (pathname === '/api/audit' && (req.method === 'POST' || req.method === 'GET')) {
    try {
      const body =
        req.method === 'POST'
          ? await readJsonBody(req)
          : Object.fromEntries(parsedUrl.searchParams.entries());
      const apiKeyOverride =
        req.headers['x-qloo-api-key'] ||
        req.headers['x-api-key'] ||
        body.apiKey ||
        undefined;

      const audit = await runBlindspotAudit(qlooClient, {
        caseId: body.caseId,
        customQuery: body.customQuery,
        customCategory: body.customCategory,
        customCity: body.customCity,
        apiKeyOverride,
      });

      return sendJson(res, 200, {
        ok: true,
        audit,
        qlooStats: qlooClient.getSummary(),
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

  if (pathname === '/api/adversarial' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const result = testAdversarialCliche(body.clicheId, body.caseLabel);
      return sendJson(res, 200, {
        ok: true,
        result,
      });
    } catch (err) {
      return sendJson(res, 400, {
        ok: false,
        error: err.message || 'Adversarial gate check failed',
      });
    }
  }

  if (pathname === '/api/validate-param' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const check = validateQlooRequest(body.path || '/v2/insights', body.params || {});
      return sendJson(res, 200, check);
    } catch (err) {
      return sendJson(res, 400, { ok: false, problems: [err.message] });
    }
  }

  // Static files
  let safePath = pathname;
  if (pathname === '/') {
    safePath = '/index.html';
  } else if (pathname === '/app' || pathname === '/app/') {
    safePath = '/app.html';
  }
  const filePath = path.join(PUBLIC_DIR, path.normalize(safePath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  // SPA fallback
  const indexHtml = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(indexHtml).pipe(res);
  }

  res.writeHead(404);
  res.end('Not Found');
}

export function createBlindspotServer() {
  return http.createServer(handleRequest);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const port = Number(process.env.PORT || 8788);
  const server = createBlindspotServer();
  server.listen(port, () => {
    console.log(`BLINDSPOT Qloo Taste Engine listening on http://localhost:${port}`);
  });
}
