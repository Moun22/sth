import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { env } from '@/config/env.js';
import { connectRedis } from '@/lib/redis.js';
import { errors } from '@/middleware/errors.js';
import { health } from '@/routes/health.js';
import { login } from '@/routes/login.js';
import { offers } from '@/routes/offers.js';
import { reco } from '@/routes/reco.js';
import { stats } from '@/routes/stats.js';

const app = new Hono();

app.use('*', logger());
app.onError(errors);

app.route('/health', health);
app.route('/login', login);
app.route('/offers', offers);
app.route('/reco', reco);
app.route('/stats', stats);

await connectRedis();

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`STH API listening on http://localhost:${info.port}`);
});
