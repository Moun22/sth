import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from '@/config/env.js';
import { connectNeo4j } from '@/lib/neo4j.js';
import { connectRedis } from '@/lib/redis.js';
import { errors } from '@/middleware/errors.js';
import { metricsMiddleware } from '@/middleware/metrics.js';
import { admin } from '@/routes/admin.js';
import { events } from '@/routes/events.js';
import { health } from '@/routes/health.js';
import { login } from '@/routes/login.js';
import { metrics } from '@/routes/metrics.js';
import { offers } from '@/routes/offers.js';
import { reco } from '@/routes/reco.js';
import { stats } from '@/routes/stats.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({ origin: '*', exposeHeaders: ['X-Cache'] }));
app.use('*', metricsMiddleware);
app.onError(errors);

app.route('/health', health);
app.route('/login', login);
app.route('/offers', offers);
app.route('/reco', reco);
app.route('/stats', stats);
app.route('/metrics', metrics);
app.route('/events', events);
app.route('/admin', admin);

await Promise.all([connectRedis(), connectNeo4j()]);

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`STH API listening on http://localhost:${info.port}`);
});
