/**
 * Token Bucket Rate Limiter
 * Implements per-client rate limiting with token bucket algorithm
 */
import { logger } from './logging.js';
import { MCPError, MCPErrorCode } from '../utils/errors.js';
class TokenBucket {
    config;
    tokens;
    lastRefill;
    constructor(config) {
        this.config = config;
        this.tokens = config.maxTokens;
        this.lastRefill = Date.now();
    }
    refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const intervals = Math.floor(elapsed / this.config.refillInterval);
        if (intervals > 0) {
            this.tokens = Math.min(this.config.maxTokens, this.tokens + intervals * this.config.refillRate);
            this.lastRefill = now;
        }
    }
    consume(tokens = 1) {
        this.refill();
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }
        return false;
    }
    getAvailableTokens() {
        this.refill();
        return this.tokens;
    }
}
export class RateLimiter {
    config;
    buckets = new Map();
    cleanupInterval;
    constructor(config) {
        this.config = config;
        // Clean up inactive buckets every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }
    checkLimit(clientId, tokens = 1) {
        let bucket = this.buckets.get(clientId);
        if (!bucket) {
            bucket = new TokenBucket(this.config);
            this.buckets.set(clientId, bucket);
        }
        if (!bucket.consume(tokens)) {
            const available = bucket.getAvailableTokens();
            logger.warn({ clientId, available, required: tokens }, 'Rate limit exceeded');
            throw new MCPError(MCPErrorCode.RateLimitExceeded, 'Rate limit exceeded. Please try again later.', { availableTokens: available, requiredTokens: tokens });
        }
    }
    cleanup() {
        const threshold = this.config.maxTokens * 0.9;
        let removed = 0;
        for (const [clientId, bucket] of this.buckets.entries()) {
            // Remove buckets that are nearly full (inactive clients)
            if (bucket.getAvailableTokens() >= threshold) {
                this.buckets.delete(clientId);
                removed++;
            }
        }
        if (removed > 0) {
            logger.debug({ removed, remaining: this.buckets.size }, 'Cleaned up rate limit buckets');
        }
    }
    destroy() {
        clearInterval(this.cleanupInterval);
        this.buckets.clear();
    }
}
export function createRateLimiter() {
    const config = {
        maxTokens: parseInt(process.env.RATE_LIMIT_TOKENS || '100', 10),
        refillRate: parseInt(process.env.RATE_LIMIT_REFILL_RATE || '10', 10),
        refillInterval: parseInt(process.env.RATE_LIMIT_REFILL_INTERVAL || '1000', 10),
    };
    logger.info({ config }, 'Rate limiter initialized');
    return new RateLimiter(config);
}
//# sourceMappingURL=rateLimit.js.map