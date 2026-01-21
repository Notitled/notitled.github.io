// ============================================
// SHARE MANAGER - Social Sharing Functionality
// ============================================

import { BLOG_INFO } from '../core/config.js';
import { i18n } from '../features/language.js';

/**
 * Manages social sharing functionality
 */
/**
 * @typedef {Object} Post
 * @property {string} slug
 * @property {string} title
 * @property {string} excerpt
 * @property {string} [date]
 * @property {string} [preview]
 * @property {string[]} [tags]
 */

/**
 * Manages social sharing functionality
 */
export class ShareManager {
    constructor() {
        this.popup = /** @type {HTMLElement|null} */ (null);
        this.isOpen = false;
        this.currentPost = /** @type {Post|null} */ (null);
        this.boundCloseOnOutsideClick = this.closeOnOutsideClick.bind(this);
    }

    /**
     * Initialize share manager
     */
    init() {
        // Close popup on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Get shareable URL for a post (uses static HTML page for proper OG tags)
     * @param {string} slug - Post slug
     * @returns {string} Shareable URL
     */
    getShareUrl(slug) {
        return `${BLOG_INFO.url}/posts/${slug}.html`;
    }

    /**
     * Open share popup for a post
     * @param {Post} post - Post data {slug, title, excerpt}
     * @param {HTMLElement} anchorElement - Element to position popup near
     */
    open(post, anchorElement) {
        this.currentPost = post;

        // Close existing popup if any
        this.close();

        // Create popup
        this.popup = this.createPopup(post);
        const container = document.getElementById('post-content');
        if (container) {
            container.appendChild(this.popup); // Changed from this.toast to this.popup
        } else {
            document.body.appendChild(this.popup); // Changed from this.toast to this.popup
        }

        // Position popup
        this.positionPopup(anchorElement);

        // Show popup with animation
        requestAnimationFrame(() => {
            this.popup.classList.add('visible');
        });

        this.isOpen = true;

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', this.boundCloseOnOutsideClick);
        }, 0);
    }

    /**
     * Close share popup
     */
    close() {
        if (this.popup) {
            this.popup.classList.remove('visible');
            setTimeout(() => {
                if (this.popup && this.popup.parentNode) {
                    this.popup.parentNode.removeChild(this.popup);
                }
                this.popup = null;
            }, 200);
        }
        this.isOpen = false;
        document.removeEventListener('click', this.boundCloseOnOutsideClick);
    }

    /**
     * Close popup when clicking outside
     * @param {Event} e - Click event
     */
    closeOnOutsideClick(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        if (this.popup && !this.popup.contains(target) && !target.closest('.share-button')) {
            this.close();
        }
    }

    /**
     * Create share popup element
     * @param {Post} post - Post data
     * @returns {HTMLElement} Popup element
     */
    createPopup(post) {
        const shareUrl = this.getShareUrl(post.slug);
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(post.title);
        const encodedText = encodeURIComponent(`${post.title}\n\n${post.excerpt}`);

        const popup = document.createElement('div');
        popup.className = 'share-popup';
        popup.innerHTML = `
            <button class="share-popup-close" aria-label="${i18n.t('common.close')}">×</button>
            <div class="share-popup-options">
                <button class="share-option" data-action="telegram" aria-label="${i18n.t('share.telegram')}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span>${i18n.t('share.telegram')}</span>
                </button>
                <button class="share-option" data-action="twitter" aria-label="${i18n.t('share.twitter')}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>${i18n.t('share.twitter')}</span>
                </button>
                <button class="share-option" data-action="copy" aria-label="${i18n.t('share.copy')}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <span>${i18n.t('common.copy')}</span>
                </button>
                ${this.hasNativeShare() ? `
                <button class="share-option" data-action="native" aria-label="${i18n.t('share.more')}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    <span>${i18n.t('common.more')}</span>
                </button>
                ` : ''}
            </div>
        `;

        // Bind actions
        popup.querySelector('.share-popup-close').addEventListener('click', () => this.close());

        popup.querySelectorAll('.share-option').forEach(btn => {
            btn.addEventListener('click', (e) => { // Added 'e' parameter
                const target = e.target;
                if (target instanceof Element) { // Check if target is an Element
                    const option = target.closest('.share-option');
                    if (option && 'dataset' in option) {
                        const action = (/** @type {HTMLElement} */ (option)).dataset.action;
                        if (action) this.handleShareAction(action, post, shareUrl); // Passed post, shareUrl
                    }
                }
            });
        });

        return popup;
    }

    /**
     * Position popup near anchor element
     * @param {HTMLElement} anchor - Anchor element
     */
    positionPopup(anchor) {
        if (!this.popup || !anchor) return;

        const rect = anchor.getBoundingClientRect();
        const popupRect = this.popup.getBoundingClientRect();

        let left = rect.left;
        let top = rect.bottom + 8;

        // Adjust if goes off screen
        if (left + popupRect.width > window.innerWidth) {
            left = window.innerWidth - popupRect.width - 16;
        }
        if (left < 16) {
            left = 16;
        }
        if (top + popupRect.height > window.innerHeight) {
            top = rect.top - popupRect.height - 8;
        }

        this.popup.style.left = `${left}px`;
        this.popup.style.top = `${top}px`;
    }

    /**
     * Handle share action
     * @param {string} action - Action type
     * @param {Post} post - Post data
     * @param {string} shareUrl - Share URL
     */
    handleShareAction(action, post, shareUrl) {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(post.title);

        switch (action) {
            case 'telegram':
                window.open(
                    `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
                    '_blank',
                    'width=550,height=450'
                );
                break;

            case 'twitter':
                window.open(
                    `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
                    '_blank',
                    'width=550,height=450'
                );
                break;

            case 'copy':
                this.copyToClipboard(shareUrl);
                break;

            case 'native':
                this.nativeShare(post, shareUrl);
                break;
        }

        this.close();
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast(i18n.t('share.copied'));
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast(i18n.t('share.copied'));
        }
    }

    /**
     * Check if native share API is available
     * @returns {boolean}
     */
    hasNativeShare() {
        return typeof navigator.share === 'function';
    }

    /**
     * Use native share API
     * @param {Object} post - Post data
     * @param {string} shareUrl - Share URL
     */
    async nativeShare(post, shareUrl) {
        try {
            await navigator.share({
                title: post.title,
                text: post.excerpt,
                url: shareUrl
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     */
    showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.share-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}
