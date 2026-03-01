/**
 * Token Bucket Rate Limiter
 * Implements per-client rate limiting with token bucket algorithm
 */
export interface RateLimitConfig {
    maxTokens: number;
    refillRate: number;
    refillInterval: number;
}
export declare class RateLimiter {
    private config;
    private buckets;
    private cleanupInterval;
    constructor(config: RateLimitConfig);
    checkLimit(clientId: string, tokens?: number): void;
    private cleanup;
    destroy(): void;
}
export declare function createRateLimiter(): RateLimiter;
//# sourceMappingURL=rateLimit.d.ts.map