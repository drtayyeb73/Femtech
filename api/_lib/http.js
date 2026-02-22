function applyCors(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return true;
    }
    return false;
}

function sendJson(res, statusCode, payload) {
    res.status(statusCode).json(payload);
}

async function parseJsonBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string' && req.body.trim()) {
        try {
            return JSON.parse(req.body);
        } catch (_) {
            throw new Error('Invalid JSON body');
        }
    }
    const raw = await readStream(req);
    if (!raw.trim()) return {};
    try {
        return JSON.parse(raw);
    } catch (_) {
        throw new Error('Invalid JSON body');
    }
}

function readStream(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
            if (data.length > 1024 * 1024) {
                reject(new Error('Payload too large'));
                req.destroy();
            }
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

module.exports = {
    applyCors,
    sendJson,
    parseJsonBody
};
