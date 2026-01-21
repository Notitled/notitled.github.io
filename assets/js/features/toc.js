// ============================================
// TABLE OF CONTENTS MODULE
// ============================================

import { CONFIG } from '../core/config.js';
import { i18n } from '../features/language.js';

/**
 * Generate Table of Contents from HTML content
 */
export class TOCGenerator {
    /**
     * Extract headings and generate TOC
     * @param {string} htmlContent - Parsed post HTML
     * @returns {{toc: import('../core/types.ts').TOCHeading[], html: string}} TOC data and modified HTML
     */
    generate(htmlContent) {
        /** @type {import('../core/types.ts').TOCHeading[]} */
        const headings = [];
        let headingIndex = 0;

        // Add IDs to headings and extract structure
        const modifiedHTML = htmlContent.replace(
            /<h([2-3])([^>]*)>(.*?)<\/h\1>/gi,
            (match, level, attrs, text) => {
                const id = this.slugify(text) + '-' + headingIndex;
                headingIndex++;

                headings.push({
                    id,
                    text: this.stripTags(text),
                    level: parseInt(level)
                });

                // Check if already has id
                if (attrs.includes('id=')) {
                    return match;
                }

                return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
            }
        );

        return {
            toc: headings,
            html: modifiedHTML
        };
    }

    /**
     * Render TOC as HTML
     * @param {import('../core/types.ts').TOCHeading[]} headings - TOC headings
     * @returns {string} TOC HTML
     */
    render(headings) {
        if (headings.length < 2) return ''; // Don't show TOC for short posts

        const items = headings.map(h => `
            <li class="toc-item toc-level-${h.level}">
                <a href="#${h.id}" class="toc-link">${this.escapeHtml(h.text)}</a>
            </li>
        `).join('');

        return `
            <nav class="toc" aria-label="${i18n.t('post.toc')}">
                <h2 class="toc-title">${i18n.t('post.toc')}</h2>
                <ul class="toc-list">
                    ${items}
                </ul>
            </nav>
        `;
    }

    /**
     * Create URL-friendly slug from text
     * @param {string} text 
     * @returns {string}
     */
    slugify(text) {
        return this.stripTags(text)
            .toLowerCase()
            .trim()
            .replace(/[^\w\sа-яё-]/gi, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }

    /**
     * Strip HTML tags from text
     * @param {string} html 
     * @returns {string}
     */
    stripTags(html) {
        return html.replace(/<[^>]*>/g, '');
    }

    /**
     * Escape HTML entities
     * @param {string} text 
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Setup scroll spy for TOC highlighting
     * @param {Array} headings - TOC headings
     */
    setupScrollSpy(headings) {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const id = entry.target.id;
                    const tocLink = document.querySelector(`.toc-link[href="#${id}"]`);

                    if (tocLink) {
                        if (entry.isIntersecting) {
                            // Remove active from all
                            document.querySelectorAll('.toc-link').forEach(l =>
                                l.classList.remove('active')
                            );
                            tocLink.classList.add('active');
                        }
                    }
                });
            },
            {
                rootMargin: '-20% 0px -70% 0px',
                threshold: 0
            }
        );

        headings.forEach(h => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });

        return observer;
    }
}
