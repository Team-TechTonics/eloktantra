import Fastify from 'fastify';
import cors from '@fastify/cors';
import proxy from '@fastify/http-proxy';
import dotenv from 'dotenv';

import { config } from '@eloktantra/config';
import {
  corsOriginFromList,
  dependencyHealthCheck,
  registerDefaultErrorHandler,
  registerGracefulShutdown,
  registerSecurityHeaders,
} from '@eloktantra/utils';

dotenv.config();

const SERVICE_NAME = 'api-gateway';
const PORT = Number.parseInt(process.env.PORT || '4000', 10);

const fastify = Fastify({
  logger: { level: config.logLevel },
  trustProxy: true,
  requestTimeout: config.requestTimeoutMs,
});

registerSecurityHeaders(fastify, config.isProduction);
registerDefaultErrorHandler(fastify, SERVICE_NAME);
registerGracefulShutdown(fastify, SERVICE_NAME, config.shutdownTimeoutMs);

fastify.register(cors, {
  origin: corsOriginFromList(config.corsOrigins),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

fastify.get('/health', async () => {
  return { success: true, status: 'ok', service: SERVICE_NAME, timestamp: new Date().toISOString() };
});

fastify.get('/ready', async () => {
  const dependencies = {
    auth: `${config.services.auth.url}/health`,
    candidate: `${config.services.candidate.url}/health`,
    manifesto: `${config.services.manifesto.url}/health`,
    promise: `${config.services.promiseTracker.url}/health`,
    issue: `${config.services.issueReporting.url}/health`,
    voting: `${config.services.voting.url}/health`,
    identity: `${config.services.identity.url}/health`,
    ledger: `${config.services.ledger.url}/health`,
    audit: `${config.services.audit.url}/health`,
  };

  const checks = await Promise.all(
    Object.entries(dependencies).map(async ([name, endpoint]) => {
      const result = await dependencyHealthCheck(endpoint);
      return [name, result] as const;
    })
  );

  const summary = Object.fromEntries(checks);
  const healthy = checks.every(([, value]) => value.ok);

  return {
    success: healthy,
    status: healthy ? 'ready' : 'degraded',
    service: SERVICE_NAME,
    checks: summary,
    timestamp: new Date().toISOString(),
  };
});

const proxyOpts = {
  http2: false,
};

fastify.register(proxy, {
  ...proxyOpts,
  upstream: config.services.auth.url,
  prefix: '/auth',
  rewritePrefix: '/auth',
});

fastify.register(proxy, {
  ...proxyOpts,
  upstream: config.services.candidate.url,
  prefix: '/candidates',
  rewritePrefix: '/',
});

fastify.register(proxy, {
  ...proxyOpts,
  upstream: config.services.manifesto.url,
  prefix: '/manifestos',
  rewritePrefix: '/manifestos',
});

fastify.register(proxy, {
  ...proxyOpts,
  upstream: config.services.promiseTracker.url,
  prefix: '/promises',
  rewritePrefix: '/promises',
});

fastify.register(proxy, {
  ...proxyOpts,
  upstream: config.services.issueReporting.url,
  prefix: '/issues',
  rewritePrefix: '/issues',
});

fastify.register(proxy, {
  ...proxyOpts,
  upstream: config.services.voting.url,
  prefix: '/voting',
  rewritePrefix: '/',
});

fastify.register(proxy, {
  ...proxyOpts,
  upstream: config.services.audit.url,
  prefix: '/audit',
  rewritePrefix: '/audit',
});

fastify.register(proxy, {
  ...proxyOpts,
  upstream: config.services.identity.url,
  prefix: '/identity',
  rewritePrefix: '/',
});

fastify.register(proxy, {
  ...proxyOpts,
  upstream: config.services.voting.url,
  prefix: '/election',
  rewritePrefix: '/elections',
});

fastify.setNotFoundHandler(async (_request, reply) => {
  return reply.code(404).send({ success: false, error: 'Route not found' });
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: config.host });
    fastify.log.info(`${SERVICE_NAME} running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();
