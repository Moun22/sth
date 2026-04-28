import { createClient } from 'redis';
import { env } from '@/config/env.js';

export const redis = createClient({ url: env.redisUrl });

redis.on('error', (err) => console.error('Redis error:', err));

export async function connectRedis() {
  await redis.connect();
  console.log(`Redis connected on ${env.redisUrl}`);
}
