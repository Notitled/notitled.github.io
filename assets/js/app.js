// ============================================
// BLOG APPLICATION
// ============================================

// Configuration Constants
const CONFIG = {
    DEBOUNCE_DELAY: 300,
    SCROLL_THRESHOLD: 300,
    WORDS_PER_MINUTE: 200,
    CACHE_DURATION: 3600000, // 1 hour in ms
    ANIMATION_DELAY_INCREMENT: 100,
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE: 1000 // ms
};

// Global Error Handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Show user-friendly message if needed
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

class Blog {
    constructor() {
        this.posts = [];
        this.allPosts = []; // For search
        this.currentView = 'home';
        this.app = document.getElementById('app');
        this.loading = document.getElementById('loading');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.loadedPosts = new Map(); // Cache for loaded MD files
        this.searchInput = document.getElementById('search-input');
        this.scrollToTopBtn = document.getElementById('scroll-to-top');
        this.themeToggle = document.querySelector('.theme-toggle');

        this.init();
    }

    async init() {
        // Configure marked.js for better performance
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
                mangle: false
            });
        }

        // Load theme preference
        this.initTheme();

        // Setup event listeners
        this.setupNavigation();
        this.setupSearch();
        this.setupScrollToTop();
        this.setupThemeToggle();

        // Load posts
        await this.loadPosts();

        // Initial render
        this.render();

        // Register Service Worker
        this.registerServiceWorker();
    }

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

    // ============================================
    // THEME MANAGEMENT
    // ============================================
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Default to light theme
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    setupThemeToggle() {
        if (!this.themeToggle) return;

        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update meta theme-color
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#1a1a1a' : '#ffffff');
            }
        });
    }

    // ============================================
    // DATA LOADING
    // ============================================
    async loadPosts() {
        try {
            const response = await fetch('posts/index.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить список постов');
            }

            this.allPosts = await response.json();
            this.posts = [...this.allPosts]; // Copy for filtering

            // Sort by date (newest first)
            this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
            this.posts = [];
            this.allPosts = [];
        }
    }

    async loadPost(slug, retries = CONFIG.MAX_RETRIES) {
        // Check cache first (memory)
        if (this.loadedPosts.has(slug)) {
            return this.loadedPosts.get(slug);
        }

        // Check localStorage cache
        const cached = this.getFromCache(slug);
        if (cached) {
            this.loadedPosts.set(slug, cached);
            return cached;
        }

        // Retry mechanism
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(`posts/${slug}.md`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const markdown = await response.text();

                // Check if marked is available
                if (typeof marked === 'undefined') {
                    console.error('marked.js не загружен!');
                    throw new Error('Markdown парсер не загружен');
                }

                const html = marked.parse(markdown);

                // Cache the result (memory + localStorage)
                this.loadedPosts.set(slug, html);
                this.saveToCache(slug, html);

                return html;
            } catch (error) {
                const isLastAttempt = i === retries - 1;

                if (isLastAttempt) {
                    console.error('Failed to load post after retries:', error);
                    console.error('Slug:', slug);

                    return `
                        <div class="error-state">
                            <h2>😔 Пост не найден</h2>
                            <p>К сожалению, этот пост недоступен.</p>
                            <p style="font-size: 0.875rem; color: var(--text-tertiary); margin-top: 1rem;">
                                Ошибка: ${error.message}
                            </p>
                            <a href="#" class="back-button">Вернуться к постам</a>
                        </div>
                    `;
                }

                // Exponential backoff
                const delay = CONFIG.RETRY_DELAY_BASE * (i + 1);
                console.log(`Retry ${i + 1}/${retries} after ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }

    // LocalStorage cache helpers
    getFromCache(slug) {
        try {
            const key = `blog_post_${slug}`;
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age < CONFIG.CACHE_DURATION) {
                console.log(`Cache hit for ${slug} (age: ${Math.round(age / 1000)}s)`);
                return data;
            }

            // Cache expired
            localStorage.removeItem(key);
            return null;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    }

    saveToCache(slug, data) {
        try {
            const key = `blog_post_${slug}`;
            localStorage.setItem(key, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }

    // ============================================
    // SEARCH
    // ============================================
    setupSearch() {
        // Search input will be created dynamically on search page
    }

    performSearch(query) {
        if (!query.trim()) {
            return this.allPosts;
        }

        const lowerQuery = query.toLowerCase();
        return this.allPosts.filter(post =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.excerpt.toLowerCase().includes(lowerQuery) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    }

    setupSearchPage() {
        const searchInput = document.getElementById('search-page-input');
        const searchResults = document.getElementById('search-results');

        if (!searchInput || !searchResults) return;

        let searchTimeout;

        const displayResults = (query) => {
            const results = this.performSearch(query);

            if (!query.trim()) {
                searchResults.innerHTML = '<p class="search-hint">Введите запрос для поиска по заголовкам и описаниям постов</p>';
                return;
            }

            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="empty-state">
                        <h2>🔍 Ничего не найдено</h2>
                        <p>Попробуйте изменить поисковый запрос</p>
                    </div>
                `;
                return;
            }

            const postsHTML = results.map((post, index) => {
                const previewHTML = post.preview ? `
                    <div class="post-card-preview">
                        <img src="${this.escapeHtml(post.preview)}"
                             alt="${this.escapeHtml(post.title)}"
                             loading="lazy">
                    </div>
                ` : '';

                return `
                    <article class="post-card" data-slug="${post.slug}" style="animation-delay: ${index * CONFIG.ANIMATION_DELAY_INCREMENT}ms">
                        ${previewHTML}
                        <div class="post-card-content">
                            <div class="post-card-date">${this.formatDate(post.date)}</div>
                            <h2 class="post-card-title">${this.escapeHtml(post.title)}</h2>
                            <p class="post-card-excerpt">${this.escapeHtml(post.excerpt)}</p>
                            <div class="post-card-meta">
                                <span class="post-card-read-more">Читать далее</span>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');

            searchResults.innerHTML = `
                <p class="search-count">Найдено постов: ${results.length}</p>
                <div class="posts-grid">
                    ${postsHTML}
                </div>
            `;

            // Setup click handlers for result cards
            searchResults.querySelectorAll('.post-card').forEach(card => {
                card.addEventListener('click', () => {
                    const slug = card.dataset.slug;
                    this.navigateTo('post', slug);
                });
            });
        };

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                displayResults(e.target.value);
            }, CONFIG.DEBOUNCE_DELAY);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                displayResults('');
            }
        });
    }

    // ============================================
    // SCROLL TO TOP
    // ============================================
    setupScrollToTop() {
        if (!this.scrollToTopBtn) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
                this.scrollToTopBtn.classList.add('visible');
            } else {
                this.scrollToTopBtn.classList.remove('visible');
            }

            // Update reading progress if on post page
            if (this.currentView === 'post') {
                this.updateReadingProgress();
            }
        });

        // Scroll to top on click
        this.scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    updateReadingProgress() {
        const progressBar = document.querySelector('.reading-progress');
        if (!progressBar) return;

        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = (window.scrollY / documentHeight) * 100;

        progressBar.style.width = `${Math.min(scrolled, 100)}%`;
    }

    // ============================================
    // NAVIGATION
    // ============================================
    setupNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                this.currentView = e.state.view;
                this.currentSlug = e.state.slug;
                this.render(false);
                this.updatePageMeta();
            }
        });
    }

    navigateTo(view, slug = null, pushState = true) {
        this.currentView = view;
        this.currentSlug = slug;

        // Update active nav link
        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === view);
        });

        // Update URL
        if (pushState) {
            const url = slug ? `#${slug}` : view === 'home' ? '#' : `#${view}`;
            history.pushState({ view, slug }, '', url);
        }

        // Update page metadata
        this.updatePageMeta();

        this.render();
    }

    updatePageMeta() {
        let title = 'Notitled - Личный блог';
        let description = 'Личный минималистичный блог о технологиях, разработке и творчестве';
        let canonicalUrl = 'https://notitled.github.io/';

        if (this.currentView === 'post' && this.currentSlug) {
            const post = this.posts.find(p => p.slug === this.currentSlug);
            if (post) {
                title = `${post.title} - Notitled`;
                description = post.excerpt;
                canonicalUrl = `https://notitled.github.io/#${this.currentSlug}`;
            }
        } else if (this.currentView === 'contacts') {
            title = 'Контакты - Notitled';
            description = 'Свяжитесь со мной';
            canonicalUrl = 'https://notitled.github.io/#contacts';
        } else if (this.currentView === 'search') {
            title = 'Поиск - Notitled';
            description = 'Поиск по постам блога';
            canonicalUrl = 'https://notitled.github.io/#search';
        }

        document.title = title;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', description);
        }

        // Update canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = canonicalUrl;

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        const ogUrl = document.querySelector('meta[property="og:url"]');

        if (ogTitle) ogTitle.setAttribute('content', title);
        if (ogDesc) ogDesc.setAttribute('content', description);
        if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

        // Update Twitter tags
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        const twitterDesc = document.querySelector('meta[name="twitter:description"]');
        const twitterUrl = document.querySelector('meta[name="twitter:url"]');

        if (twitterTitle) twitterTitle.setAttribute('content', title);
        if (twitterDesc) twitterDesc.setAttribute('content', description);
        if (twitterUrl) twitterUrl.setAttribute('content', canonicalUrl);

        // Update Structured Data
        this.updateStructuredData();
    }

    updateStructuredData() {
        // Remove existing structured data
        const existing = document.querySelector('script[type="application/ld+json"][data-dynamic]');
        if (existing) existing.remove();

        let structuredData = null;

        if (this.currentView === 'post' && this.currentSlug) {
            const post = this.posts.find(p => p.slug === this.currentSlug);
            if (post) {
                structuredData = {
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": post.title,
                    "description": post.excerpt,
                    "datePublished": post.date,
                    "dateModified": post.date,
                    "author": {
                        "@type": "Person",
                        "name": "Notitled",
                        "url": "https://notitled.github.io"
                    },
                    "publisher": {
                        "@type": "Person",
                        "name": "Notitled"
                    },
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `https://notitled.github.io/#${this.currentSlug}`
                    },
                    "url": `https://notitled.github.io/#${this.currentSlug}`,
                    "inLanguage": "ru-RU"
                };

                if (post.preview) {
                    structuredData.image = `https://notitled.github.io/${post.preview}`;
                }
            }
        }

        if (structuredData) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-dynamic', 'true');
            script.textContent = JSON.stringify(structuredData, null, 2);
            document.head.appendChild(script);
        }
    }

    // ============================================
    // RENDERING
    // ============================================
    async render(animate = true) {
        // Show loading
        this.showLoading();

        // Render based on current view
        let content = '';

        switch (this.currentView) {
            case 'home':
                content = this.renderPostsList();
                break;
            case 'post':
                content = await this.renderPost(this.currentSlug);
                break;
            case 'search':
                content = this.renderSearch();
                break;
            case 'contacts':
                content = this.renderContacts();
                break;
            default:
                content = this.renderPostsList();
        }

        // Remove reading progress bar if leaving post page
        if (this.currentView !== 'post') {
            const existing = document.querySelector('.reading-progress');
            if (existing) existing.remove();
        }

        // Update DOM
        requestAnimationFrame(() => {
            this.app.innerHTML = content;
            this.hideLoading();

            // Setup post card listeners
            if (this.currentView === 'home') {
                this.setupPostCardListeners();
            }

            // Setup back button
            const backButton = this.app.querySelector('.back-button');
            if (backButton) {
                backButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateTo('home');
                });
            }

            // Add reading progress bar for posts
            if (this.currentView === 'post') {
                this.addReadingProgress();
            }

            // Setup search on search page
            if (this.currentView === 'search') {
                this.setupSearchPage();
            }

            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    addReadingProgress() {
        // Remove existing progress bar if any
        const existing = document.querySelector('.reading-progress');
        if (existing) existing.remove();

        // Add new progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        document.body.appendChild(progressBar);
    }

    calculateReadTime(content) {
        const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / CONFIG.WORDS_PER_MINUTE);
    }

    renderPostsList() {
        if (this.posts.length === 0) {
            const hasSearch = this.searchInput && this.searchInput.value.trim();
            return `
                <div class="empty-state">
                    <h2>${hasSearch ? '🔍 Ничего не найдено' : 'Пока нет постов'}</h2>
                    <p>${hasSearch ? 'Попробуйте изменить поисковый запрос' : 'Добавьте свой первый пост в папку <code>posts/</code>'}</p>
                </div>
            `;
        }

        const postsHTML = this.posts.map((post, index) => {
            const previewHTML = post.preview ? `
                <div class="post-card-preview">
                    <img src="${this.escapeHtml(post.preview)}" 
                         alt="${this.escapeHtml(post.title)}"
                         loading="lazy">
                </div>
            ` : '';

            return `
                <article class="post-card" data-slug="${post.slug}" style="animation-delay: ${index * CONFIG.ANIMATION_DELAY_INCREMENT}ms">
                    ${previewHTML}
                    <div class="post-card-content">
                        <div class="post-card-date">${this.formatDate(post.date)}</div>
                        <h2 class="post-card-title">${this.escapeHtml(post.title)}</h2>
                        <p class="post-card-excerpt">${this.escapeHtml(post.excerpt)}</p>
                        <div class="post-card-meta">
                            <span class="post-card-read-more">Читать далее</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        return `
            <div class="posts-grid">
                ${postsHTML}
            </div>
        `;
    }

    async renderPost(slug) {
        const post = this.posts.find(p => p.slug === slug) || this.allPosts.find(p => p.slug === slug);

        if (!post) {
            return '<div class="error">Пост не найден</div>';
        }

        const content = await this.loadPost(slug);
        const readTime = this.calculateReadTime(content);

        return `
            <article class="post-view">
                <a href="#" class="back-button">Назад к постам</a>
                <header class="post-header">
                    <div class="post-date">${this.formatDate(post.date)} • ${readTime} мин чтения</div>
                    <h1 class="post-title">${this.escapeHtml(post.title)}</h1>
                </header>
                <div class="post-content">
                    ${content}
                </div>
            </article>
        `;
    }

    renderSearch() {
        return `
            <div class="search-page">
                <h1>Поиск по постам</h1>
                
                <div class="search-container-page">
                    <input type="search" 
                           class="search-input" 
                           id="search-page-input" 
                           placeholder="Начните вводить для поиска..." 
                           autocomplete="off" 
                           autofocus>
                    <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                    </svg>
                </div>
                
                <div id="search-results" class="search-results">
                    <p class="search-hint">Введите запрос для поиска по заголовкам и описаниям постов</p>
                </div>
            </div>
        `;
    }

    renderContacts() {
        return `
            <div class="contacts-page">
                <h1>Контакты</h1>
                
                <div class="contact-item">
                    <label>Email</label>
                    <div class="contact-value">
                        <a href="mailto:your.email@example.com">your.email@example.com</a>
                    </div>
                </div>
                
                <div class="contact-item">
                    <label>Telegram</label>
                    <div class="contact-value">
                        <a href="https://t.me/yourusername" target="_blank" rel="noopener">@yourusername</a>
                    </div>
                </div>
                
                <div class="contact-item">
                    <label>GitHub</label>
                    <div class="contact-value">
                        <a href="https://github.com/yourusername" target="_blank" rel="noopener">github.com/yourusername</a>
                    </div>
                </div>
                
                <div class="contact-item">
                    <label>Twitter / X</label>
                    <div class="contact-value">
                        <a href="https://twitter.com/yourusername" target="_blank" rel="noopener">@yourusername</a>
                    </div>
                </div>
                
                <div class="contact-item">
                    <label>LinkedIn</label>
                    <div class="contact-value">
                        <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener">linkedin.com/in/yourusername</a>
                    </div>
                </div>
            </div>
        `;
    }

    setupPostCardListeners() {
        const cards = this.app.querySelectorAll('.post-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const slug = card.dataset.slug;
                this.navigateTo('post', slug);
            });
        });
    }

    // ============================================
    // UTILITIES
    // ============================================
    showLoading() {
        if (this.loading) {
            this.loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        if (this.loading) {
            this.loading.classList.add('hidden');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// INITIALIZE APP
// ============================================
// Wait for DOM and marked.js to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Blog();
    });
} else {
    new Blog();
}
