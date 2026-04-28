import { Hono } from 'hono';

export const login = new Hono();

login.post('/', (c) => c.json({ error: 'Not implemented' }, 501));
