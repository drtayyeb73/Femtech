const { applyCors, sendJson, parseJsonBody } = require('../../../../_lib/http');
const { createReply } = require('../../../../_lib/forum-store');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Method not allowed.' });
        return;
    }

    const slug = String(req.query?.slug || '');
    const postId = String(req.query?.postId || '');
    try {
        const body = await parseJsonBody(req);
        const reply = await createReply(slug, postId, {
            content: body?.content,
            author: body?.author
        });
        sendJson(res, 201, { reply });
    } catch (err) {
        sendJson(res, err?.status || 500, { error: err?.message || 'Internal server error.' });
    }
};
