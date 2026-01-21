// ============================================
// PAGINATION MODULE
// ============================================

import { CONFIG } from '../core/config.js';

/**
 * Pagination utilities
 */
export class Paginator {
    /**
     * @param {number} perPage - Items per page
     */
    constructor(perPage = CONFIG.POSTS_PER_PAGE) {
        this.perPage = perPage;
    }

    /**
     * Paginate an array of items
     * @param {Array} items - All items
     * @param {number} page - Current page (1-indexed)
     * @returns {{items: Array, pagination: Object}}
     */
    paginate(items, page = 1) {
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / this.perPage);
        const currentPage = Math.max(1, Math.min(page, totalPages));

        const startIndex = (currentPage - 1) * this.perPage;
        const endIndex = startIndex + this.perPage;
        const paginatedItems = items.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            pagination: {
                currentPage,
                totalPages,
                totalItems,
                perPage: this.perPage,
                hasNext: currentPage < totalPages,
                hasPrev: currentPage > 1,
                startIndex: startIndex + 1,
                endIndex: Math.min(endIndex, totalItems)
            }
        };
    }

    /**
     * Get page numbers to display (with ellipsis logic)
     * @param {number} currentPage 
     * @param {number} totalPages 
     * @param {number} maxVisible - Max visible page numbers
     * @returns {Array} Page numbers or '...'
     */
    getPageNumbers(currentPage, totalPages, maxVisible = 5) {
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [];
        const half = Math.floor(maxVisible / 2);

        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('...');
        }

        for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    }
}
