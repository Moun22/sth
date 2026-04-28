import type { ObjectId } from 'mongodb';

export interface Leg {
  flightNum: string;
  dep: string;
  arr: string;
  duration: number; // minutes
}

export interface Hotel {
  name: string;
  nights: number;
  price: number;
}

export interface Activity {
  title: string;
  price: number;
}

/** Document MongoDB brut */
export interface OfferDocument {
  _id: ObjectId;
  from: string;
  to: string;
  departDate: Date;
  returnDate: Date;
  provider: string;
  price: number;
  currency: string;
  legs: Leg[];
  hotel: Hotel | null;
  activity: Activity | null;
}

/** Réponse liste (GET /offers) */
export interface OfferSummary {
  id: string;
  provider: string;
  price: number;
  currency: string;
  legs: Leg[];
  hotel: Hotel | null;
  activity: Activity | null;
}

/** Réponse détail (GET /offers/:id) */
export interface OfferDetail extends OfferSummary {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  relatedOffers: string[];
}

export function toOfferSummary(doc: OfferDocument): OfferSummary {
  return {
    id: doc._id.toHexString(),
    provider: doc.provider,
    price: doc.price,
    currency: doc.currency,
    legs: doc.legs,
    hotel: doc.hotel,
    activity: doc.activity,
  };
}

export function toOfferDetail(doc: OfferDocument, relatedOffers: string[]): OfferDetail {
  return {
    id: doc._id.toHexString(),
    from: doc.from,
    to: doc.to,
    departDate: doc.departDate.toISOString(),
    returnDate: doc.returnDate.toISOString(),
    provider: doc.provider,
    price: doc.price,
    currency: doc.currency,
    legs: doc.legs,
    hotel: doc.hotel,
    activity: doc.activity,
    relatedOffers,
  };
}

