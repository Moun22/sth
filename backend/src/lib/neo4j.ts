import type { OfferDocument } from '../models/offer.js';

/**
 * Hook Neo4j — à metre par Fatima.
 * Retourne les IDs d'offres liées (villes proches + mêmes dates).
 * Fallback : tableau vide si Neo4j n'est pas dispo.
 */
export async function getRelatedOffers(
  _offer: OfferDocument,
  _limit: number
): Promise<string[]> {
  // Fatima remplace ce corps par la vraie logique Neo4j stp.
  return [];
}

export const neo4j = null;
