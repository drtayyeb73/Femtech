const { applyCors, sendJson } = require('./_lib/http');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;
    if (req.method !== 'GET') {
        sendJson(res, 405, { error: 'Method not allowed.' });
        return;
    }
    sendJson(res, 200, { ok: true, service: 'forum-api', now: new Date().toISOString() });
};
