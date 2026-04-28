# SupDeVinci Travel Hub (STH)

Mini-projet NoSQL polyglotte : API HTTP/JSON adossée à Redis, MongoDB et Neo4j.

Voir [`REPARTITION.md`](./REPARTITION.md) pour la répartition des tâches.

## Démarrer la stack

```bash
docker compose up --build
```

Une fois la stack levée :

- API Hono : http://localhost:3000
- Health   : http://localhost:3000/health
- Redis    : `redis://localhost:6379`
- MongoDB  : `mongodb://localhost:27017`
- Neo4j    : http://localhost:7474 (bolt sur 7687, user `neo4j` / pass `sthpassword`)

## Développement local du backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Structure du repo

```
backend/    code Node.js + Hono (API)
frontend/   à venir (bonus, Stitch)
docker-compose.yml   orchestre l'API + les 3 bases
```
