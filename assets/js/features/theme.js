// ============================================
// THEME MANAGER
// ============================================

import { CONFIG } from '../core/config.js';

/**
 * Manages light/dark theme switching
 */
export class ThemeManager {
    constructor() {
        this.toggleButton = document.querySelector('.theme-toggle');
    }

    /**
     * Initialize theme from saved preference or system default
     */
    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Default to light theme
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    /**
     * Setup theme toggle button listener
     */
    setupToggle() {
        if (!this.toggleButton) return;

        this.toggleButton.addEventListener('click', () => this.toggle());
    }

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        this.updateMetaThemeColor(newTheme);
    }

    /**
     * Update meta theme-color for browser UI
     * @param {string} theme - 'light' or 'dark'
     */
    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
        }
    }

    /**
     * Get current theme
     * @returns {string} Current theme ('light' or 'dark')
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}
