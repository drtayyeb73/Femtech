const { kv } = require('@vercel/kv');

const TOPICS_KEY = 'forum:topics:v1';

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

function defaultTopics() {
    const createdAt = nowIso();
    return [
        { slug: 'cycle', name: 'Cycle Tracking', description: 'Share experiences and tips', createdAt },
        { slug: 'menopause', name: 'Menopause Support', description: 'Discuss symptoms and coping strategies', createdAt },
        { slug: 'fitness', name: 'Fitness & Wellness', description: 'Exercise tips and motivation', createdAt },
        { slug: 'mental', name: 'Mental Health', description: 'Support for emotional wellbeing', createdAt }
    ];
}

function postsKey(slug) {
    return `forum:posts:${slug}`;
}

function sortByDateDesc(list) {
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function ensureTopics() {
    let topics = await kv.get(TOPICS_KEY);
    if (!Array.isArray(topics) || !topics.length) {
        topics = defaultTopics();
        await kv.set(TOPICS_KEY, topics);
    }
    return topics;
}

async function getTopics() {
    return ensureTopics();
}

async function createTopic({ slug, name, description }) {
    const topicName = String(name || '').trim();
    const topicDescription = String(description || '').trim();
    const normalizedSlug = normalizeSlug(slug || topicName);
    if (!topicName || topicName.length < 3) {
        throw Object.assign(new Error('Topic name should be at least 3 characters.'), { status: 400 });
    }
    if (!normalizedSlug) {
        throw Object.assign(new Error('Topic name is invalid.'), { status: 400 });
    }
    if (topicName.length > 60) {
        throw Object.assign(new Error('Topic name is too long (max 60 characters).'), { status: 400 });
    }
    if (topicDescription.length > 180) {
        throw Object.assign(new Error('Topic description is too long (max 180 characters).'), { status: 400 });
    }
    const topics = await ensureTopics();
    if (topics.some(t => t.slug === normalizedSlug)) {
        throw Object.assign(new Error('A topic with this name already exists.'), { status: 409 });
    }
    const topic = { slug: normalizedSlug, name: topicName, description: topicDescription, createdAt: nowIso() };
    const updated = [...topics, topic];
    await kv.set(TOPICS_KEY, updated);
    return topic;
}

async function getPosts(slugInput) {
    const slug = normalizeSlug(slugInput);
    if (!slug) {
        throw Object.assign(new Error('Topic not found.'), { status: 404 });
    }
    const topics = await ensureTopics();
    if (!topics.some(t => t.slug === slug)) {
        throw Object.assign(new Error('Topic not found.'), { status: 404 });
    }
    const posts = await kv.get(postsKey(slug));
    if (!Array.isArray(posts)) return [];
    return sortByDateDesc(posts);
}

async function createPost(slugInput, { title, content, author }) {
    const slug = normalizeSlug(slugInput);
    const postTitle = String(title || '').trim();
    const postContent = String(content || '').trim();
    const postAuthor = String(author || 'Anonymous').trim() || 'Anonymous';

    const topics = await ensureTopics();
    if (!topics.some(t => t.slug === slug)) {
        throw Object.assign(new Error('Topic not found.'), { status: 404 });
    }
    if (!postTitle || !postContent) {
        throw Object.assign(new Error('Title and content are required.'), { status: 400 });
    }
    if (postTitle.length > 120) {
        throw Object.assign(new Error('Post title is too long (max 120 characters).'), { status: 400 });
    }
    if (postContent.length > 3000) {
        throw Object.assign(new Error('Post content is too long (max 3000 characters).'), { status: 400 });
    }

    const post = {
        id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: postTitle,
        content: postContent,
        author: postAuthor.slice(0, 60),
        date: nowIso()
    };
    const key = postsKey(slug);
    const existing = await kv.get(key);
    const next = Array.isArray(existing) ? [post, ...existing] : [post];
    await kv.set(key, next.slice(0, 2000));
    return post;
}

module.exports = {
    getTopics,
    createTopic,
    getPosts,
    createPost
};
