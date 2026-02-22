# Online Forum Setup

This app now uses an online forum API instead of local-only post storage.

## Run locally

1. Open a terminal in this project folder.
2. Start the forum API:

```powershell
node forum-server.js
```

3. Open `index.html` in your browser.

The frontend calls `http://localhost:8787/api` by default.

## API base override (optional)

If you deploy the API to another host, set this once in browser console:

```js
localStorage.setItem('femtechForumApiBase', 'https://your-domain.com/api');
location.reload();
```

## Deploy

- Deploy `forum-server.js` on any Node.js host (VM, VPS, Render, Railway, etc.).
- Keep `forum-data.json` writable by the Node process.
- Open port `8787` or map your platform port to the server.

## Endpoints

- `GET /api/health`
- `GET /api/topics`
- `POST /api/topics`
- `GET /api/topics/:slug/posts`
- `POST /api/topics/:slug/posts`
