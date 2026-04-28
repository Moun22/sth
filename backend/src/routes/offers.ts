import { Hono } from 'hono';

export const offers = new Hono();

offers.get('/', (c) => c.json({ error: 'Not implemented' }, 501));
offers.get('/:id', (c) => c.json({ error: 'Not implemented' }, 501));
