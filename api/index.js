import { sendJson } from './_utils.js';
import healthHandler from './health.js';
import presetsHandler from './presets.js';
import auditHandler from './audit.js';
import adversarialHandler from './adversarial.js';
import validateParamHandler from './validate-param.js';

export default async function handler(req, res) {
  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  const pathname = parsedUrl.pathname;

  if (pathname.includes('/health')) {
    return healthHandler(req, res);
  }
  if (pathname.includes('/presets')) {
    return presetsHandler(req, res);
  }
  if (pathname.includes('/audit')) {
    return auditHandler(req, res);
  }
  if (pathname.includes('/adversarial')) {
    return adversarialHandler(req, res);
  }
  if (pathname.includes('/validate-param')) {
    return validateParamHandler(req, res);
  }

  return sendJson(res, 200, {
    service: 'blindspot-qloo',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/presets',
      '/api/audit',
      '/api/adversarial',
      '/api/validate-param',
    ],
  });
}
