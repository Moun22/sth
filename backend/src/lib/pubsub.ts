import { redis } from '@/lib/redis.js'

export const OFFERS_NEW_CHANNEL = 'offers:new'

export type NewOfferEvent = {
  offerId: string
  from: string
  to: string
}

export async function publishNewOffer(event: NewOfferEvent): Promise<void> {
  await redis.publish(OFFERS_NEW_CHANNEL, JSON.stringify(event))
}
