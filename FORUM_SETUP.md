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
- In APK / `file://` mode, set a global API base in `index.html`:

```html
<script>
  window.FEMTECH_FORUM_API_BASE = 'https://your-vercel-app.vercel.app/api';
</script>
```

- Local override is still possible with `localStorage` key `femtechForumApiBase`.

## Make one shared forum for all devices

1. Deploy this project to Vercel.
2. Connect Vercel KV (Storage -> KV) to the project.
3. Redeploy.
4. Open your deployed API health URL and confirm JSON response:
   - `https://your-vercel-app.vercel.app/api/health`
5. In `index.html`, replace `window.FEMTECH_FORUM_API_BASE` with that same `/api` base.
6. Rebuild APK and reinstall it.

After this, all users/devices will read/write the same cloud forum posts.

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
