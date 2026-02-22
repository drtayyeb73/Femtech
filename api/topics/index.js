const { applyCors, sendJson, parseJsonBody } = require('../_lib/http');
const { getTopics, createTopic } = require('../_lib/forum-store');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === 'GET') {
            const topics = await getTopics();
            sendJson(res, 200, { topics });
            return;
        }

        if (req.method === 'POST') {
            const body = await parseJsonBody(req);
            const topic = await createTopic({
                slug: body?.slug,
                name: body?.name,
                description: body?.description
            });
            sendJson(res, 201, { topic });
            return;
        }

        sendJson(res, 405, { error: 'Method not allowed.' });
    } catch (err) {
        sendJson(res, err?.status || 500, { error: err?.message || 'Internal server error.' });
    }
};
