import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { randomUUID } from 'node:crypto';
import type { Sort } from 'mongodb';
import { z } from 'zod';
import { getOffersCollection } from '@/lib/mongo.js';
import { cacheGet, cacheSet } from '@/lib/cache.js';
import { registerOfferNode } from '@/lib/neo4j.js';
import { publishNewOffer } from '@/lib/pubsub.js';
import { getCachedOffer, setCachedOffer } from '@/lib/redis.js';
import { toOfferSummary, toOfferDetail } from '@/models/offer.js';
import type { OfferDocument, OfferSummary } from '@/models/offer.js';

export const offers = new Hono();

const cityCode = z.string().regex(/^[A-Z]{3}$/, 'must be a 3-letter uppercase code');

const createOfferSchema = z
  .object({
    from: cityCode,
    to: cityCode,
    departDate: z.coerce.date(),
    returnDate: z.coerce.date(),
    provider: z.string().min(1),
    price: z.number().positive(),
    currency: z.string().length(3),
    legs: z
      .array(
        z.object({
          flightNum: z.string().min(1),
          dep: z.string().min(1),
          arr: z.string().min(1),
          duration: z.number().int().positive(),
        }),
      )
      .min(1),
    hotel: z
      .object({
        name: z.string().min(1),
        nights: z.number().int().positive(),
        price: z.number().positive(),
      })
      .nullable()
      .optional(),
    activity: z
      .object({
        title: z.string().min(1),
        price: z.number().positive(),
      })
      .nullable()
      .optional(),
  })
  .refine((d) => d.returnDate >= d.departDate, {
    message: 'returnDate must be on or after departDate',
    path: ['returnDate'],
  });

offers.get('/', async (c) => {
  const rawFrom = c.req.query('from');
  const rawTo = c.req.query('to');
  const rawLimit = c.req.query('limit');
  const rawQ = c.req.query('q')?.trim() || undefined;

  if (!rawFrom || !rawTo) {
    throw new HTTPException(400, { message: 'Query parameters "from" and "to" are required.' });
  }

  const from = rawFrom.trim().toUpperCase();
  const to = rawTo.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(from)) throw new HTTPException(400, { message: '"from" must be a 3-letter city code.' });
  if (!/^[A-Z]{3}$/.test(to)) throw new HTTPException(400, { message: '"to" must be a 3-letter city code.' });

  const limit = rawLimit ? Math.min(50, Math.max(1, parseInt(rawLimit, 10) || 10)) : 10;

  const cacheKey = `offers:${from}:${to}`;
  const cached = rawQ ? null : await cacheGet<OfferSummary[]>(cacheKey);
  if (cached) {
    c.header('X-Cache', 'HIT');
    c.header('Content-Type', 'application/json; charset=utf-8');
    return c.json(cached.slice(0, limit));
  }

  const col = await getOffersCollection();
  const filter: Record<string, unknown> = { from, to };
  if (rawQ) filter['$text'] = { $search: rawQ };

  const sort: Sort = rawQ ? { score: { $meta: 'textScore' }, price: 1 } : { price: 1 };
  const projection = rawQ ? { score: { $meta: 'textScore' } } : undefined;

  const docs = (await col.find(filter, projection ? { projection } : {}).sort(sort).limit(50).toArray()) as OfferDocument[];
  const summaries = docs.map(toOfferSummary);

  if (!rawQ) await cacheSet(cacheKey, summaries, 60, { compress: true }).catch(() => {});

  c.header('X-Cache', 'MISS');
  c.header('Content-Type', 'application/json; charset=utf-8');
  return c.json(summaries.slice(0, limit));
});

offers.post(
  '/',
  zValidator('json', createOfferSchema, (result, c) => {
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.') || '<root>',
        message: i.message,
      }));
      return c.json({ error: 'Validation failed', issues }, 400);
    }
  }),
  async (c) => {
    const body = c.req.valid('json');
    const id = `offer-${randomUUID()}`;
    const doc = {
      id,
      from: body.from,
      to: body.to,
      departDate: body.departDate,
      returnDate: body.returnDate,
      provider: body.provider,
      price: body.price,
      currency: body.currency,
      legs: body.legs,
      hotel: body.hotel ?? null,
      activity: body.activity ?? null,
    };

    const col = await getOffersCollection();
    const { insertedId } = await col.insertOne(doc);

    const inserted: OfferDocument = { _id: insertedId, ...doc };

    await registerOfferNode(id, doc.from);
    await publishNewOffer({ offerId: id, from: doc.from, to: doc.to });

    c.header('Content-Type', 'application/json; charset=utf-8');
    return c.json(toOfferDetail(inserted, []), 201);
  },
);

offers.get('/:id', async (c) => {
  const id = c.req.param('id');

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new HTTPException(400, { message: 'Offer id must be a non-empty alphanumeric string.' });
  }

  const cached = await getCachedOffer(id);
  if (cached) {
    c.header('X-Cache', 'HIT');
    c.header('Content-Type', 'application/json; charset=utf-8');
    return c.json(JSON.parse(cached));
  }

  const col = await getOffersCollection();
  const doc = (await col.findOne({ id })) as OfferDocument | null;

  if (!doc) throw new HTTPException(404, { message: 'Offer not found.' });

  let relatedOffers: string[] = [];
  try {
    const { getRelatedOffers } = await import('@/lib/neo4j.js');
    if (typeof getRelatedOffers === 'function') {
      relatedOffers = await getRelatedOffers(doc, 3);
    }
  } catch {}

  const detail = toOfferDetail(doc, relatedOffers);
  await setCachedOffer(id, detail).catch(() => {});

  c.header('X-Cache', 'MISS');
  c.header('Content-Type', 'application/json; charset=utf-8');
  return c.json(detail);
});
