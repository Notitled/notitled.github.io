// ============================================
// SEO MANAGER - Meta Tags & Structured Data
// ============================================

import { BLOG_INFO } from '../core/config.js';

/**
 * Manages SEO meta tags and structured data
 */
export class SEOManager {
    /**
     * Update all page metadata
     * @param {string} view - Current view
     * @param {Object|null} post - Current post if viewing a post
     */
    update(view, post = null) {
        const meta = this.getMetaForView(view, post);

        this.updateTitle(meta.title);
        this.updateDescription(meta.description);
        this.updateCanonical(meta.url);
        this.updateOpenGraph(meta);
        this.updateTwitter(meta);
        this.updateStructuredData(view, post);
    }

    /**
     * Get metadata for current view
     * @param {string} view - View name
     * @param {Object|null} post - Post data if applicable
     * @returns {Object} Meta data
     */
    getMetaForView(view, post) {
        const base = {
            title: BLOG_INFO.title,
            description: BLOG_INFO.description,
            url: BLOG_INFO.url + '/'
        };

        switch (view) {
            case 'post':
                if (post) {
                    return {
                        title: `${post.title} - ${BLOG_INFO.name}`,
                        description: post.excerpt,
                        url: `${BLOG_INFO.url}/#${post.slug}`,
                        image: post.preview ? `${BLOG_INFO.url}/${post.preview}` : null
                    };
                }
                return base;

            case 'contacts':
                return {
                    ...base,
                    title: `Контакты - ${BLOG_INFO.name}`,
                    description: 'Свяжитесь со мной',
                    url: `${BLOG_INFO.url}/#contacts`
                };

            case 'search':
                return {
                    ...base,
                    title: `Поиск - ${BLOG_INFO.name}`,
                    description: 'Поиск по постам блога',
                    url: `${BLOG_INFO.url}/#search`
                };

            default:
                return base;
        }
    }

    /**
     * Update document title
     * @param {string} title 
     */
    updateTitle(title) {
        document.title = title;
    }

    /**
     * Update meta description
     * @param {string} description 
     */
    updateDescription(description) {
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', description);
        }
    }

    /**
     * Update canonical URL
     * @param {string} url 
     */
    updateCanonical(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = url;
    }

    /**
     * Update Open Graph tags
     * @param {Object} meta 
     */
    updateOpenGraph(meta) {
        this.setMetaContent('meta[property="og:title"]', meta.title);
        this.setMetaContent('meta[property="og:description"]', meta.description);
        this.setMetaContent('meta[property="og:url"]', meta.url);
        if (meta.image) {
            this.setMetaContent('meta[property="og:image"]', meta.image);
        }
    }

    /**
     * Update Twitter Card tags
     * @param {Object} meta 
     */
    updateTwitter(meta) {
        this.setMetaContent('meta[name="twitter:title"]', meta.title);
        this.setMetaContent('meta[name="twitter:description"]', meta.description);
        this.setMetaContent('meta[name="twitter:url"]', meta.url);
        if (meta.image) {
            this.setMetaContent('meta[name="twitter:image"]', meta.image);
        }
    }

    /**
     * Helper to set meta tag content
     * @param {string} selector 
     * @param {string} content 
     */
    setMetaContent(selector, content) {
        const el = document.querySelector(selector);
        if (el) {
            el.setAttribute('content', content);
        }
    }

    /**
     * Update structured data (JSON-LD)
     * @param {string} view 
     * @param {Object|null} post 
     */
    updateStructuredData(view, post) {
        // Remove existing dynamic structured data
        const existing = document.querySelector('script[type="application/ld+json"][data-dynamic]');
        if (existing) existing.remove();

        if (view !== 'post' || !post) return;

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": post.date,
            "dateModified": post.date,
            "author": {
                "@type": "Person",
                "name": BLOG_INFO.author,
                "url": BLOG_INFO.url
            },
            "publisher": {
                "@type": "Person",
                "name": BLOG_INFO.author
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${BLOG_INFO.url}/#${post.slug}`
            },
            "url": `${BLOG_INFO.url}/#${post.slug}`,
            "inLanguage": BLOG_INFO.language
        };

        if (post.preview) {
            structuredData.image = `${BLOG_INFO.url}/${post.preview}`;
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-dynamic', 'true');
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
    }
}
