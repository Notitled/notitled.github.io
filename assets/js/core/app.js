// ============================================
// BLOG APPLICATION - Main Entry Point
// ============================================

import { CONFIG } from './config.js';
import { calculateReadTime, debounce } from '../utils/utils.js';
import { ThemeManager } from '../features/theme.js';
import { Router } from './router.js';
import { PostsAPI } from '../services/api.js';
import { SEOManager } from '../services/seo.js';
import { Paginator } from '../features/pagination.js';
import { TOCGenerator } from '../features/toc.js';
import { ShareManager } from '../features/share.js';
import { i18n } from '../features/language.js';
import {
    renderPostsList,
    renderPost,
    renderSearchPage,
    renderSearchResults,
    renderContactsPage,
    renderError,
} from '../utils/templates.js';

// Global Error Handlers
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

/**
 * Main Blog Application
 */
class Blog {
    constructor() {
        // DOM elements
        this.app = document.getElementById('app');
        this.loading = document.getElementById('loading');

        // Managers
        this.theme = new ThemeManager();
        this.api = new PostsAPI();
        this.seo = new SEOManager();
        this.paginator = new Paginator();
        this.toc = new TOCGenerator();
        this.share = new ShareManager();
        this.tocObserver = null;
        this.router = new Router((view, slug, updateMeta) => this.handleNavigation(view, slug, updateMeta));

        this.init();
    }

    async init() {
        // Configure marked.js
        this.configureMarked();

        // Initialize theme
        this.theme.init();
        this.theme.setupToggle();

        // Initialize share
        this.share.init();

        // Setup UI
        this.updateStaticTranslations();
        this.setupLanguageToggle();

        // Load posts
        await this.api.loadPosts();


        // Initialize router (handles initial route)
        this.router.init();

        // Initial render
        await this.render();

        // Register Service Worker
        this.registerServiceWorker();
    }

    /**
     * Configure marked.js parser
     */
    configureMarked() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
                mangle: false
            });
        }
    }

    /**
     * Update static translations in the DOM
     */
    updateStaticTranslations() {
        const elements = document.querySelectorAll('[data-t]');
        elements.forEach(el => {
            const key = el.getAttribute('data-t');
            if (key) {
                el.textContent = i18n.t(key);
            }
        });

        // Update language toggle text
        const langToggleText = document.querySelector('.lang-text');
        if (langToggleText) {
            langToggleText.textContent = i18n.getLanguage().toUpperCase();
        }

        // Update footer
        const footerText = document.querySelector('.footer p');
        if (footerText) {
            const currentYear = new Date().getFullYear();
            footerText.innerHTML = i18n.getLanguage() === 'ru'
                ? `&copy; ${currentYear} Notitled. Создано с любовью к минимализму.`
                : `&copy; ${currentYear} Notitled. Built with love for minimalism.`;
        }
    }

    /**
     * Setup language toggle listener
     */
    setupLanguageToggle() {
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                i18n.toggleLanguage();
            });
        }
    }

    /**
     * Register Service Worker for PWA
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }

    /**
     * Handle navigation events from router
     * @param {string} view - Current view name
     * @param {string|null} slug - Post slug or null
     * @param {boolean} updateMeta - Whether to update SEO meta tags
     */
    async handleNavigation(view, slug, updateMeta) {
        if (updateMeta) {
            const post = slug && view === 'post' ? this.api.findBySlug(slug) : null;
            this.seo.update(view, post);
        }
        await this.render();
    }

    /**
     * Main render function
     */
    async render() {
        this.showLoading();

        // Cleanup previous TOC observer
        if (this.tocObserver) {
            this.tocObserver.disconnect();
            this.tocObserver = null;
        }

        const route = this.router.getCurrentRoute();
        const view = route.view;
        const slug = route.slug;
        const page = route.page;

        let content = '';

        switch (view) {
            case 'home':
                content = this.renderHome(page);
                break;
            case 'post':
                content = await this.renderPostView(slug);
                break;
            case 'search':
                content = renderSearchPage();
                break;
            case 'contacts':
                content = renderContactsPage();
                break;
            default:
                content = this.renderHome(page);
        }



        // Update DOM
        requestAnimationFrame(() => {
            this.app.innerHTML = content;
            this.hideLoading();

            this.setupDynamicListeners(view);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * Render home page with pagination
     */
    renderHome(page = 1) {
        const posts = this.api.getPosts();
        const { items, pagination } = this.paginator.paginate(posts, page);
        return renderPostsList(items, pagination);
    }


    /**
     * Render post view
     * @param {string} slug - Post slug
     */
    async renderPostView(slug) {
        const post = this.api.findBySlug(slug);

        if (!post) {
            return renderError();
        }

        let content = await this.api.loadPost(slug);
        const readTime = calculateReadTime(content);

        // Generate TOC
        const { toc, html: modifiedContent } = this.toc.generate(content);
        const tocHTML = this.toc.render(toc);

        // Store TOC data for scroll spy
        this.currentTOC = toc;

        return renderPost(post, modifiedContent, readTime, tocHTML);
    }

    /**
     * Setup dynamic event listeners after render
     * @param {string} view - Current view name
     */
    setupDynamicListeners(view) {
        // Post card click handlers
        if (view === 'home' || view === 'tag') {
            this.setupPostCardListeners();
        }

        // Pagination handlers
        if (view === 'home') {
            this.setupPaginationListeners();
        }


        // Back button
        const backButton = this.app.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.router.navigateTo('home');
            });
        }

        // TOC and Share for posts
        if (view === 'post') {
            // Setup TOC scroll spy
            if (this.currentTOC && this.currentTOC.length > 0) {
                this.tocObserver = this.toc.setupScrollSpy(this.currentTOC);
            }

            // TOC link smooth scroll
            document.querySelectorAll('.toc-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Setup share button
            this.setupShareButton();
        }

        // Search page setup
        if (view === 'search') {
            this.setupSearchPage();
        }
    }

    /**
     * Setup post card click listeners
     */
    setupPostCardListeners() {
        const cards = this.app ? this.app.querySelectorAll('.post-card') : [];
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const target = /** @type {HTMLElement} */ (e.target);

                const htmlCard = /** @type {HTMLElement} */ (card);
                const slug = htmlCard.dataset.slug;
                if (slug) {
                    this.router.navigateTo('post', slug);
                }
            });
        });
    }


    /**
     * Setup pagination button listeners
     */
    setupPaginationListeners() {
        const pagination = this.app ? this.app.querySelector('.pagination') : null;
        if (!pagination) return;

        pagination.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const htmlBtn = /** @type {HTMLButtonElement} */ (btn);
                const page = parseInt(htmlBtn.dataset.page || '1');
                if (page && !htmlBtn.disabled) {
                    this.router.goToPage(page);
                }
            });
        });
    }

    /**
     * Setup share button click listener
     */
    setupShareButton() {
        const shareBtn = this.app ? this.app.querySelector('.share-button') : null;
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const htmlBtn = /** @type {HTMLElement} */ (shareBtn);
                const post = {
                    slug: htmlBtn.dataset.slug || '',
                    title: htmlBtn.dataset.title || '',
                    excerpt: htmlBtn.dataset.excerpt || ''
                };

                this.share.open(post, htmlBtn);
            });
        }
    }

    /**
     * Setup search page functionality
     */
    setupSearchPage() {
        const searchInput = document.getElementById('search-page-input');
        const searchResults = document.getElementById('search-results');

        if (!searchInput || !searchResults) return;

        const displayResults = debounce((query) => {
            const results = this.api.search(query);
            searchResults.innerHTML = renderSearchResults(results, query);

            // Setup click handlers for result cards
            this.setupPostCardListeners();
        });

        searchInput.addEventListener('input', (e) => {
            displayResults(e.target.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                displayResults('');
            }
        });
    }

    /**
     * Show loading spinner
     */
    showLoading() {
        if (this.loading) {
            this.loading.classList.remove('hidden');
        }
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        if (this.loading) {
            this.loading.classList.add('hidden');
        }
    }
}

// ============================================
// INITIALIZE APP
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Blog();
    });
} else {
    new Blog();
}
