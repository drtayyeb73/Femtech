# Online Forum Setup

This app now supports Vercel API routes with persistent storage via Vercel KV.

## Vercel production setup

1. In Vercel dashboard, open your project `Settings`.
2. Go to `Storage` -> `Create Database` -> choose `KV`.
3. Connect that KV database to this project.
4. Redeploy the project.

When KV is connected, Vercel injects needed environment variables automatically.

## Default API behavior

- In deployed environments, the app uses same-origin API: `/api`.
- Local override is still possible with `localStorage` key `femtechForumApiBase`.

## API base override (optional)

```js
localStorage.setItem('femtechForumApiBase', 'https://your-domain.com/api');
location.reload();
```

## Endpoints

- `GET /api/health`
- `GET /api/topics`
- `POST /api/topics`
- `GET /api/topics/:slug/posts`
- `POST /api/topics/:slug/posts`
- `POST /api/topics/:slug/posts/:postId/replies`

## Local development options

1. Quick local backend (file-based):

```powershell
node forum-server.js
```

Then use:

```js
localStorage.setItem('femtechForumApiBase', 'http://localhost:8787/api');
location.reload();
```

2. Vercel local dev (KV-backed) using Vercel CLI:

```powershell
vercel dev
```
