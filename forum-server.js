const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = process.env.FORUM_HOST || '0.0.0.0';
const PORT = Number(process.env.FORUM_PORT || 8787);
const DATA_PATH = path.join(__dirname, 'forum-data.json');

function normalizeSlug(input) {
    return String(input || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
        .slice(0, 48);
}

function nowIso() {
    return new Date().toISOString();
}

function seedData() {
    return {
        topics: [
            { slug: 'cycle', name: 'Cycle Tracking', description: 'Share experiences and tips', createdAt: nowIso() },
            { slug: 'menopause', name: 'Menopause Support', description: 'Discuss symptoms and coping strategies', createdAt: nowIso() },
            { slug: 'fitness', name: 'Fitness & Wellness', description: 'Exercise tips and motivation', createdAt: nowIso() },
            { slug: 'mental', name: 'Mental Health', description: 'Support for emotional wellbeing', createdAt: nowIso() }
        ],
        postsByTopic: {
            cycle: [
                {
                    id: `p_${Date.now()}_1`,
                    title: 'Welcome to Cycle Tracking',
                    content: 'Introduce yourself and share your cycle tracking tips.',
                    author: 'Moderator',
                    date: nowIso()
                }
            ],
            menopause: [],
            fitness: [],
            mental: []
        }
    };
}

function readDb() {
    if (!fs.existsSync(DATA_PATH)) {
        const initial = seedData();
        fs.writeFileSync(DATA_PATH, JSON.stringify(initial, null, 2), 'utf8');
        return initial;
    }
    try {
        const raw = fs.readFileSync(DATA_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return seedData();
        if (!Array.isArray(parsed.topics)) parsed.topics = [];
        if (!parsed.postsByTopic || typeof parsed.postsByTopic !== 'object') parsed.postsByTopic = {};
        return parsed;
    } catch (_) {
        return seedData();
    }
}

function writeDb(db) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function send(res, status, payload) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(payload));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 1024 * 1024) {
                reject(new Error('Payload too large'));
                req.destroy();
            }
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (_) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}

function sortByDateDesc(list) {
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    try {
        if (req.method === 'GET' && pathname === '/api/health') {
            send(res, 200, { ok: true, service: 'forum-api', now: nowIso() });
            return;
        }

        if (req.method === 'GET' && pathname === '/api/topics') {
            const db = readDb();
            send(res, 200, { topics: db.topics });
            return;
        }

        if (req.method === 'POST' && pathname === '/api/topics') {
            const body = await readBody(req);
            const name = String(body?.name || '').trim();
            const description = String(body?.description || '').trim();
            const slug = normalizeSlug(body?.slug || name);
            if (!name || name.length < 3) {
                send(res, 400, { error: 'Topic name should be at least 3 characters.' });
                return;
            }
            if (!slug) {
                send(res, 400, { error: 'Topic name is invalid.' });
                return;
            }
            if (name.length > 60) {
                send(res, 400, { error: 'Topic name is too long (max 60 characters).' });
                return;
            }
            if (description.length > 180) {
                send(res, 400, { error: 'Topic description is too long (max 180 characters).' });
                return;
            }
            const db = readDb();
            if (db.topics.some(t => t.slug === slug)) {
                send(res, 409, { error: 'A topic with this name already exists.' });
                return;
            }
            const topic = { slug, name, description, createdAt: nowIso() };
            db.topics.push(topic);
            if (!Array.isArray(db.postsByTopic[slug])) db.postsByTopic[slug] = [];
            writeDb(db);
            send(res, 201, { topic });
            return;
        }

        const postsPath = pathname.match(/^\/api\/topics\/([^/]+)\/posts$/);
        if (postsPath && req.method === 'GET') {
            const slug = normalizeSlug(decodeURIComponent(postsPath[1] || ''));
            const db = readDb();
            const topic = db.topics.find(t => t.slug === slug);
            if (!topic) {
                send(res, 404, { error: 'Topic not found.' });
                return;
            }
            const posts = Array.isArray(db.postsByTopic[slug]) ? db.postsByTopic[slug] : [];
            send(res, 200, { posts: sortByDateDesc(posts) });
            return;
        }

        if (postsPath && req.method === 'POST') {
            const slug = normalizeSlug(decodeURIComponent(postsPath[1] || ''));
            const db = readDb();
            const topic = db.topics.find(t => t.slug === slug);
            if (!topic) {
                send(res, 404, { error: 'Topic not found.' });
                return;
            }
            const body = await readBody(req);
            const title = String(body?.title || '').trim();
            const content = String(body?.content || '').trim();
            const author = String(body?.author || 'Anonymous').trim() || 'Anonymous';
            if (!title || !content) {
                send(res, 400, { error: 'Title and content are required.' });
                return;
            }
            if (title.length > 120) {
                send(res, 400, { error: 'Post title is too long (max 120 characters).' });
                return;
            }
            if (content.length > 3000) {
                send(res, 400, { error: 'Post content is too long (max 3000 characters).' });
                return;
            }
            const safeAuthor = author.slice(0, 60);
            const post = {
                id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                title,
                content,
                author: safeAuthor,
                date: nowIso()
            };
            if (!Array.isArray(db.postsByTopic[slug])) db.postsByTopic[slug] = [];
            db.postsByTopic[slug].unshift(post);
            writeDb(db);
            send(res, 201, { post });
            return;
        }

        send(res, 404, { error: 'Not found.' });
    } catch (err) {
        send(res, 500, { error: err?.message || 'Internal server error.' });
    }
});

server.listen(PORT, HOST, () => {
    console.log(`Forum API listening on http://${HOST}:${PORT}/api`);
});
