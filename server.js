// BLINDSPOT HTTP Server & API Router (Vercel Node.js Server + Local Runtime)
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

// Explicit static file references so @vercel/nft bundles all public assets into serverless Lambda
export const BUNDLED_ASSETS = [
  path.join(__dirname, 'public', 'index.html'),
  path.join(__dirname, 'public', 'app.html'),
  path.join(__dirname, 'public', 'landing.css'),
  path.join(__dirname, 'public', 'dashboard.css'),
  path.join(__dirname, 'public', 'styles.css'),
  path.join(__dirname, 'public', 'assets', 'landing.js'),
  path.join(__dirname, 'public', 'assets', 'dashboard.js'),
  path.join(__dirname, 'public', 'assets', 'charts.js'),
  path.join(__dirname, 'public', 'assets', 'photo-bridge.jpg'),
  path.join(__dirname, 'public', 'assets', 'photo-facade.jpg'),
  path.join(__dirname, 'public', 'assets', 'photo-lattice.jpg'),
  path.join(__dirname, 'public', 'assets', 'photo-wall.jpg'),
];

export const qlooClient = new QlooClient();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
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
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch (_e) {
      return Promise.resolve({});
    }
  }
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

function resolveStaticFile(safePath) {
  const normalized = path.normalize(safePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const candidatePublic = path.join(PUBLIC_DIR, normalized);
  if (candidatePublic.startsWith(PUBLIC_DIR) && fs.existsSync(candidatePublic) && fs.statSync(candidatePublic).isFile()) {
    return candidatePublic;
  }
  const candidateRoot = path.join(__dirname, normalized);
  if (candidateRoot.startsWith(__dirname) && fs.existsSync(candidateRoot) && fs.statSync(candidateRoot).isFile()) {
    return candidateRoot;
  }
  return null;
}

export async function handleRequest(req, res) {
  try {
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

    if (pathname === '/api/ping') {
      return sendJson(res, 200, { pong: true, time: new Date().toISOString() });
    }

    if ((pathname === '/api/health' || pathname === '/api') && req.method === 'GET') {
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
        const headers = req.headers || {};
        const apiKeyOverride =
          headers['x-qloo-api-key'] ||
          headers['x-api-key'] ||
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
        if (err instanceof QlooAuthError || err.code === 'QLOO_AUTH') {
          return sendJson(res, 401, {
            ok: false,
            error: typeof err.toJSON === 'function' ? err.toJSON() : { code: 'QLOO_AUTH', message: err.message },
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

    // Static files (synchronous buffer response so serverless Lambda never closes stream prematurely)
    let safePath = pathname;
    if (pathname === '/' || pathname === '/index.html') {
      safePath = '/index.html';
    } else if (pathname === '/app' || pathname === '/app/' || pathname === '/app.html') {
      safePath = '/app.html';
    } else if (pathname === '/app.js') {
      safePath = '/assets/dashboard.js';
    } else if (pathname === '/landing.js') {
      safePath = '/assets/landing.js';
    }

    const resolvedFile = resolveStaticFile(safePath);
    if (resolvedFile) {
      const ext = path.extname(resolvedFile).toLowerCase();
      const buffer = fs.readFileSync(resolvedFile);
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Content-Length': buffer.length,
      });
      return res.end(buffer);
    }

    // Fallback to index.html for navigation routes
    const fallbackHtml = resolveStaticFile('/index.html');
    if (fallbackHtml) {
      const buffer = fs.readFileSync(fallbackHtml);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': buffer.length,
      });
      return res.end(buffer);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  } catch (err) {
    console.error('Unhandled request error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    return res.end(JSON.stringify({ ok: false, error: err.message || 'Internal Server Error' }));
  }
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

export default handleRequest;
