## Monorepo
- Next.js app lives at `src/app/*`.
- NestJS API lives at `apps/api`.

## Run locally
1. Install deps in both root and API:
   - `npm install`
   - `cd apps/api && npm install`
2. Start API (port 4000):
   - `npm run start:dev` inside `apps/api`
3. Start Next.js (port 3000):
   - Back to repo root: `npm run dev`

## Environment
Create `apps/api/.env` (already scaffolded):
```
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET="dev_access_secret"
```

Optionally, set `NEXT_PUBLIC_API_URL` in the web environment to point to the API base URL (defaults to `http://localhost:4000`).

## Auth Flow (Best Practices)
- Credentials over HTTPS only. Cookies are `httpOnly`, `sameSite=lax` (or `none` with HTTPS) and `secure` in production.
- Short-lived access token (15m) in `httpOnly` cookie, refresh token rotation (7d) stored hashed in DB.
- `POST /api/login` sets cookies. `POST /api/refresh` rotates. `POST /api/logout` revokes.
- `GET /api/me` protected via JWT strategy reading `access_token` cookie.

## Endpoints
- `POST /api/register` { username, password }
- `POST /api/login` { username, password }
- `POST /api/refresh`
- `POST /api/logout`
- `GET /api/me`
