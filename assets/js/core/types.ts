// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Post metadata from index.json
 */
export interface Post {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    preview?: string;
    category?: string;
}


/**
 * Pagination info
 */
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    startIndex: number;
    endIndex: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
    items: T[];
    pagination: PaginationInfo;
}

/**
 * Route info
 */
export interface RouteInfo {
    view: string;
    slug: string | null;
    page: number;
}

/**
 * TOC heading
 */
export interface TOCHeading {
    id: string;
    text: string;
    level: number;
}

/**
 * TOC generation result
 */
export interface TOCResult {
    toc: TOCHeading[];
    html: string;
}

/**
 * Blog configuration
 */
export interface BlogConfig {
    DEBOUNCE_DELAY: number;
    SCROLL_THRESHOLD: number;
    WORDS_PER_MINUTE: number;
    CACHE_DURATION: number;
    ANIMATION_DELAY_INCREMENT: number;
    MAX_RETRIES: number;
    RETRY_DELAY_BASE: number;
    POSTS_PER_PAGE: number;
    TOC_MIN_HEADINGS: number;
}

/**
 * Blog info
 */
export interface BlogInfo {
    name: string;
    title: string;
    url: string;
    description: string;
    language: string;
    author: string;
}

/**
 * Contacts
 */
export interface Contacts {
    email: string;
    telegram: string;
    github: string;
    twitter: string;
    linkedin: string;
}

// Declare marked as global for TypeScript
declare global {
    const marked: {
        parse(markdown: string): string;
        setOptions(options: Record<string, unknown>): void;
    };
}
