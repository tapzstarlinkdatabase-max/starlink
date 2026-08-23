# Starlink Digital Profiles

This build intentionally contains only the public Profile 37 view, login, and the matching Profile 37 editor.

## Local development

1. Server:
   ```bash
   cd server
   npm ci
   npm run dev
   ```
2. Client in a second terminal:
   ```bash
   cd client
   npm ci
   npm run dev
   ```
3. Open `http://localhost:5173/login`.
4. Public profiles are available at `http://localhost:5173/<companyName>`.
5. After login, the user is redirected to `http://localhost:5173/edit/<mongoId>`.

## URL configuration

For local development the client uses:

```env
VITE_API_BASE_URL=http://localhost:3500/api
VITE_PUBLIC_BASE_URL=http://localhost:5173
```

For the included single-service deployment, `.env.production` uses `/api` so the built client automatically talks to the same production domain. If you deploy the frontend and API separately, replace the production values with the real URLs and rebuild the client.

The server also needs its public domain in:

```env
CLIENT_ORIGINS=https://your-starlink-domain.com
PUBLIC_APP_URL=https://your-starlink-domain.com
AUTH_COOKIE_SECURE=true
NODE_ENV=production
```

## Production build

From the project root:

```bash
npm ci --prefix server
npm ci --prefix client
npm run build --prefix client
npm start --prefix server
```

Express serves `client/dist`, so the public profile, editor, login, and API can run from the same deployment.

## Profile editing

The editor supports:
- brand/profile name, employee/customer name and designation
- welcome text
- address and Google Maps link
- phone, WhatsApp and email
- website
- Google review label/link
- public profile URL slug
- profile picture upload, replacement and deletion via Cloudinary
- 10 optional gallery photo slots with add, replace and delete
- add/delete values by filling or clearing individual fields
- one authenticated Save action for all changes

Profile edit APIs require the logged-in profile session. Public users can only read the public profile and increment its visit counter.

## Create a profile with Postman

Local endpoint:

```text
POST http://localhost:3500/api/data/profile
```

Headers:

```text
Content-Type: application/json
x-profile-create-key: STARLINK_LOCAL_CREATE_KEY
```

`PROFILE_CREATE_KEY` is read from `server/.env`. Change it to a strong secret before deployment.

A profile created with `companyName: "rabia-zubair"` is available locally at:

```text
http://localhost:5173/rabia-zubair
```

For deployment set the public app URL to your domain, for example `http://abc.com`. The same profile then resolves at:

```text
http://abc.com/rabia-zubair
```

The existing MongoDB URI, database name, `clients` collection, and client schema are unchanged.
