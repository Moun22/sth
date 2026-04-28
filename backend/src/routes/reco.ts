import { Hono } from 'hono';

export const reco = new Hono();

reco.get('/', (c) => c.json({ error: 'Not implemented' }, 501));
