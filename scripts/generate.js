/**
 * Blog Generator Script
 * Generates feed.xml and sitemap.xml from posts/index.json
 * 
 * Usage: npm run generate
 */

const fs = require('fs');
const path = require('path');

// Configuration
const siteConfig = require('../site.config.json');

// Configuration
const CONFIG = {
    BLOG_URL: siteConfig.url,
    BLOG_NAME: siteConfig.name,
    BLOG_DESCRIPTION: siteConfig.description,
    BLOG_LANGUAGE: siteConfig.language,
    AUTHOR: siteConfig.author
};

// Paths
const POSTS_INDEX = path.join(__dirname, '..', 'posts', 'index.json');
const FEED_OUTPUT = path.join(__dirname, '..', 'feed.xml');
const SITEMAP_OUTPUT = path.join(__dirname, '..', 'sitemap.xml');

/**
 * Read posts from index.json
 */
function readPosts() {
    try {
        const data = fs.readFileSync(POSTS_INDEX, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading posts:', error.message);
        return [];
    }
}

/**
 * Format date for RSS (RFC 2822)
 */
function formatRSSDate(dateString) {
    const date = new Date(dateString);
    return date.toUTCString();
}

/**
 * Format date for Sitemap (ISO 8601)
 */
function formatSitemapDate(dateString) {
    return dateString; // Already in YYYY-MM-DD format
}

/**
 * Escape XML special characters
 */
function escapeXML(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Generate RSS feed.xml
 */
function generateRSS(posts) {
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestDate = sortedPosts.length > 0 ? formatRSSDate(sortedPosts[0].date) : formatRSSDate(new Date().toISOString());

    const items = sortedPosts.map(post => `
        <item>
            <title>${escapeXML(post.title)}</title>
            <link>${CONFIG.BLOG_URL}/#${post.slug}</link>
            <guid isPermaLink="false">${post.slug}</guid>
            <description>${escapeXML(post.excerpt)}</description>
            <pubDate>${formatRSSDate(post.date)}</pubDate>
            ${post.tags ? post.tags.map(tag => `<category>${escapeXML(tag)}</category>`).join('\n            ') : ''}
        </item>`
    ).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${CONFIG.BLOG_NAME}</title>
        <link>${CONFIG.BLOG_URL}</link>
        <description>${CONFIG.BLOG_DESCRIPTION}</description>
        <language>${CONFIG.BLOG_LANGUAGE}</language>
        <lastBuildDate>${latestDate}</lastBuildDate>
        <atom:link href="${CONFIG.BLOG_URL}/feed.xml" rel="self" type="application/rss+xml"/>
        ${items}
    </channel>
</rss>
`;

    return rss;
}

/**
 * Generate sitemap.xml
 */
function generateSitemap(posts) {
    const today = new Date().toISOString().split('T')[0];
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestPostDate = sortedPosts.length > 0 ? sortedPosts[0].date : today;

    // Static pages
    const staticUrls = [
        { loc: `${CONFIG.BLOG_URL}/`, lastmod: latestPostDate, changefreq: 'weekly', priority: '1.0' },
        { loc: `${CONFIG.BLOG_URL}/#contacts`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
        { loc: `${CONFIG.BLOG_URL}/#search`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
        { loc: `${CONFIG.BLOG_URL}/#tags`, lastmod: latestPostDate, changefreq: 'weekly', priority: '0.8' }
    ];

    // Post URLs
    const postUrls = sortedPosts.map(post => ({
        loc: `${CONFIG.BLOG_URL}/#${post.slug}`,
        lastmod: post.date,
        changefreq: 'monthly',
        priority: '0.9'
    }));

    // Tag URLs
    const allTags = new Set();
    posts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => allTags.add(tag));
        }
    });

    const tagUrls = Array.from(allTags).map(tag => ({
        loc: `${CONFIG.BLOG_URL}/#tag/${encodeURIComponent(tag)}`,
        lastmod: latestPostDate,
        changefreq: 'weekly',
        priority: '0.6'
    }));

    const allUrls = [...staticUrls, ...postUrls, ...tagUrls];

    const urls = allUrls.map(url => `
    <url>
        <loc>${escapeXML(url.loc)}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`
    ).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>
`;

    return sitemap;
}

/**
 * Generate static HTML page for a post (for social media previews)
 * @param {Object} post - Post data
 * @returns {string} HTML content
 */
function generatePostHTML(post) {
    const postUrl = `${CONFIG.BLOG_URL}/#${post.slug}`;
    const staticUrl = `${CONFIG.BLOG_URL}/posts/${post.slug}.html`;
    const ogImage = post.preview
        ? `${CONFIG.BLOG_URL}/${post.preview}`
        : `${CONFIG.BLOG_URL}/assets/images/og-image.png`;

    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>${escapeXML(post.title)} - ${CONFIG.BLOG_NAME}</title>
    <meta name="description" content="${escapeXML(post.excerpt)}">
    <meta name="author" content="${CONFIG.AUTHOR}">
    <meta name="robots" content="index, follow">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${staticUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${staticUrl}">
    <meta property="og:title" content="${escapeXML(post.title)}">
    <meta property="og:description" content="${escapeXML(post.excerpt)}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${CONFIG.BLOG_NAME}">
    <meta property="og:locale" content="${CONFIG.BLOG_LANGUAGE.replace('-', '_')}">
    <meta property="article:published_time" content="${post.date}">
    <meta property="article:author" content="${CONFIG.AUTHOR}">
    ${post.tags ? post.tags.map(tag => `<meta property="article:tag" content="${escapeXML(tag)}">`).join('\n    ') : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${staticUrl}">
    <meta name="twitter:title" content="${escapeXML(post.title)}">
    <meta name="twitter:description" content="${escapeXML(post.excerpt)}">
    <meta name="twitter:image" content="${ogImage}">
    
    <!-- Telegram specific -->
    <meta property="og:image:alt" content="${escapeXML(post.title)}">
    
    <!-- Redirect to SPA -->
    <script>
        window.location.replace('${postUrl}');
    </script>
    <noscript>
        <meta http-equiv="refresh" content="0;url=${postUrl}">
    </noscript>
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #1a1a1a;
            color: #e8e8e8;
        }
        .redirect-message {
            text-align: center;
            padding: 2rem;
        }
        a {
            color: #3b82f6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="redirect-message">
        <h1>${escapeXML(post.title)}</h1>
        <p>Перенаправление...</p>
        <p><a href="${postUrl}">Нажмите здесь, если перенаправление не работает</a></p>
    </div>
</body>
</html>`;
}

/**
 * Generate static HTML pages for all posts
 * @param {Array} posts - Array of posts
 */
function generatePostPages(posts) {
    const postsDir = path.join(__dirname, '..', 'posts');

    posts.forEach(post => {
        const html = generatePostHTML(post);
        const outputPath = path.join(postsDir, `${post.slug}.html`);
        fs.writeFileSync(outputPath, html, 'utf-8');
        console.log(`✅ Generated: posts/${post.slug}.html`);
    });
}

/**
 * Main function
 */
function main() {
    console.log('📝 Generating blog files...\n');

    // Read posts
    const posts = readPosts();
    console.log(`Found ${posts.length} posts`);

    // Generate RSS
    const rss = generateRSS(posts);
    fs.writeFileSync(FEED_OUTPUT, rss, 'utf-8');
    console.log(`✅ Generated: feed.xml`);

    // Generate Sitemap
    const sitemap = generateSitemap(posts);
    fs.writeFileSync(SITEMAP_OUTPUT, sitemap, 'utf-8');
    console.log(`✅ Generated: sitemap.xml`);

    // Generate static HTML pages for posts (for social media previews)
    generatePostPages(posts);

    console.log('\n🎉 Done!');
}

main();
