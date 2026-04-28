# STH — Répartition des tâches (3 personnes)

Mini-projet **SupDeVinci Travel Hub** : micro-service HTTP/JSON polyglotte au-dessus de **Redis + MongoDB + Neo4j**. Une seule API, démarrée via `docker-compose up`, latence cible < 200 ms en cache hit, < 700 ms en cache miss.

## Découpage retenu

Un rôle = une base NoSQL principale. Le rôle Redis hérite aussi du squelette d'API + intégration (Redis touche presque toutes les routes, autant centraliser).

| Rôle | Personne | Base principale | Routes / responsabilités |
|------|----------|-----------------|--------------------------|
| A — Lead intégration & cache | Personne 1 (toi) | Redis | Squelette API, docker-compose, `/login`, cache, Pub/Sub |
| B — Catalogue | Personne 2 | MongoDB | Schéma + seed `offers`, `/offers`, `/offers/{id}` (partie Mongo) |
| C — Graphe & reco | Personne 3 | Neo4j | Schéma + seed `City`/`NEAR`, `/reco`, `relatedOffers` |

---

## Personne 1 — Lead intégration & Redis (toi)

**Objectif** : poser le squelette dans lequel B et C viennent brancher leurs accès données, et porter tout ce qui est Redis.

### Setup projet
- Choix du framework (FastAPI / Express / Spring Boot) et init du repo (structure, lint, README de démarrage).
- `docker-compose.yml` avec services : `api`, `redis`, `mongo`, `neo4j` (volumes + ports + healthchecks).
- Couche commune : middleware d'erreurs (40x/50x lisibles), logging de la durée d'exécution par requête, headers `application/json; charset=utf-8`.
- Clients NoSQL partagés (singleton Redis, client Mongo, driver Neo4j) injectés dans les handlers.

### Routes / fonctionnalités
- `POST /login` : génération UUID v4 → `SET session:<uuid> u42 EX 900` → renvoie `{ token, expires_in: 900 }`.
- Helpers cache réutilisés par B :
  - `offers:<from>:<to>` (TTL 60 s, JSON gzip)
  - `offers:<id>` (TTL 300 s, JSON détaillé)
- Pub/Sub : helper `publish_new_offer(offer)` qui pousse `{offerId, from, to}` sur le canal `offers:new`. Vérification avec `redis-cli SUBSCRIBE offers:new`.

### Livrables
- Repo bootable en une commande.
- Health endpoint (utile pour les démos).
- Doc courte sur les conventions de clés Redis et la gestion d'erreurs.

---

## Personne 2 — MongoDB / Catalogue

**Objectif** : modéliser le catalogue, le peupler, et fournir les routes de lecture des offres.

### Données
- Collection `offers` selon le schéma du sujet (`from`, `to`, `departDate`, `returnDate`, `provider`, `price`, `currency`, `legs[]`, `hotel`, `activity`).
- Index : `{ from: 1, to: 1, price: 1 }` + index texte sur `provider`.
- Script de seed (≥ 30 offres variées sur quelques couples `from/to`, dates réalistes).

### Routes
- `GET /offers?from=PAR&to=TYO&limit=10`
  1. Lookup cache Redis `offers:<from>:<to>` (helper de A). Hit → retour direct.
  2. Miss → `find({from, to}).sort({price: 1}).limit(limit)`.
  3. Stocker le JSON gzip dans Redis (EX 60).
- `GET /offers/{id}`
  1. Cache Redis `offers:<id>`. Hit → retour direct.
  2. Miss → `findOne({_id})`, mettre en cache (EX 300).
  3. Appeler le helper Neo4j de C pour remplir `relatedOffers` (3 IDs).

### Livrables
- Script d'init Mongo (création index + seed) intégré au `docker-compose`.
- Validation des paramètres (`from`, `to` obligatoires, `limit` borné).

---

## Personne 3 — Neo4j / Recommandations

**Objectif** : modéliser le graphe destinations et exposer la reco + les offres liées.

### Données
- Nœuds `(:City {code, name, country})`.
- Relations `(c1)-[:NEAR {weight}]->(c2)`.
- Script de seed Cypher (≥ 15 villes, 30 relations cohérentes avec les couples `from/to` choisis par B).

### Routes / helpers
- `GET /reco?city=PAR&k=3`
  - Cypher :
    ```cypher
    MATCH (c:City {code:$city})-[:NEAR]->(n:City)
    RETURN n.code AS city, n.weight AS score
    ORDER BY n.weight DESC LIMIT $k
    ```
  - Réponse : `[ { city, score } ]`.
- Helper `related_offers(offerId) -> [offerId, offerId, offerId]` consommé par P2 dans `/offers/{id}` (villes proches + mêmes dates).

### Livrables
- Script de seed Neo4j auto-exécuté au démarrage.
- Documentation des requêtes Cypher utilisées.

---

## Tâches transverses (à se répartir en fin de projet)

| Tâche | Suggestion |
|-------|------------|
| Tests d'intégration des 4 routes | P1 (a la vue d'ensemble) |
| Bench latence cache hit / miss | P2 (touche `/offers`) |
| README final + schéma d'archi | tous, 30 min en commun |
| Démo / scénario de présentation | tous |

## Extensions (optionnelles, 1 par personne si le temps)

- **Recherche textuelle** `?q=hotel` sur l'index texte Mongo → **P2**.
- **Analytics** `GET /stats/top-destinations` (agrégation Mongo + cache Redis) → **P1**.
- **Monitoring** `/metrics` Prometheus (latence moyenne, taux de hit cache) → **P3**.

---

## Ordre conseillé

1. **J1** — P1 pose le squelette + `docker-compose`. P2 et P3 écrivent leurs scripts de seed en parallèle.
2. **J2** — P1 fait `/login` + helpers cache/PubSub. P2 fait `/offers`. P3 fait `/reco`.
3. **J3** — P2 + P3 se synchronisent sur `/offers/{id}` (`relatedOffers`). Tests + extensions.
4. **J4** — Polish, README, démo.

## Critères de succès (à valider ensemble avant rendu)

- [ ] `docker-compose up` démarre la stack complète.
- [ ] Les 4 routes répondent avec les codes HTTP et payloads attendus.
- [ ] Cache hit observable (logs ou `/metrics`).
- [ ] `redis-cli SUBSCRIBE offers:new` reçoit bien un message à l'insertion d'une offre.
- [ ] Index Mongo et contraintes Neo4j créés au démarrage.
