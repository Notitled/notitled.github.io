import { TRANSLATIONS } from '../utils/translations.js';

/**
 * Manages application language state and translations
 */
export class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'ru';
        this.init();
    }

    init() {
        document.documentElement.lang = this.currentLang === 'ru' ? 'ru' : 'en';
    }

    /**
     * Get current language
     * @returns {string} 'ru' or 'en'
     */
    getLanguage() {
        return this.currentLang;
    }

    /**
     * Switch language
     * @param {string} lang - 'ru' or 'en'
     */
    setLanguage(lang) {
        if (this.currentLang === lang) return;
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang === 'ru' ? 'ru' : 'en';
        window.location.reload(); // Simplest way to re-render everything with new strings
    }

    /**
     * Toggle language between ru and en
     */
    toggleLanguage() {
        const newLang = this.currentLang === 'ru' ? 'en' : 'ru';
        this.setLanguage(newLang);
    }

    /**
     * Get translated string by key path (e.g., 'nav.home')
     * @param {string} path - Key path
     * @returns {string} Translated string
     */
    t(path) {
        const keys = path.split('.');
        /** @type {any} */
        let result = TRANSLATIONS[/** @type {'ru'|'en'} */ (this.currentLang)];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                console.warn(`Translation key not found: ${path} for language: ${this.currentLang}`);
                return path;
            }
        }

        return result;
    }
}

export const i18n = new LanguageManager();
