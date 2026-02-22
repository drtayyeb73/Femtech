const { applyCors, sendJson, parseJsonBody } = require('../../_lib/http');
const { getPosts, createPost } = require('../../_lib/forum-store');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;

    const slug = String(req.query?.slug || '');
    try {
        if (req.method === 'GET') {
            const posts = await getPosts(slug);
            sendJson(res, 200, { posts });
            return;
        }

        if (req.method === 'POST') {
            const body = await parseJsonBody(req);
            const post = await createPost(slug, {
                title: body?.title,
                content: body?.content,
                author: body?.author
            });
            sendJson(res, 201, { post });
            return;
        }

        sendJson(res, 405, { error: 'Method not allowed.' });
    } catch (err) {
        sendJson(res, err?.status || 500, { error: err?.message || 'Internal server error.' });
    }
};
