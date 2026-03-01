/**
 * Token Bucket Rate Limiter
 * Implements per-client rate limiting with token bucket algorithm
 */

import { logger } from './logging.js';
import { MCPError, MCPErrorCode } from '../utils/errors.js';

export interface RateLimitConfig {
  maxTokens: number;
  refillRate: number; // tokens per interval
  refillInterval: number; // milliseconds
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(private config: RateLimitConfig) {
    this.tokens = config.maxTokens;
    this.lastRefill = Date.now();
  }

  refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const intervals = Math.floor(elapsed / this.config.refillInterval);

    if (intervals > 0) {
      this.tokens = Math.min(
        this.config.maxTokens,
        this.tokens + intervals * this.config.refillRate
      );
      this.lastRefill = now;
    }
  }

  consume(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private config: RateLimitConfig) {
    // Clean up inactive buckets every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  checkLimit(clientId: string, tokens: number = 1): void {
    let bucket = this.buckets.get(clientId);

    if (!bucket) {
      bucket = new TokenBucket(this.config);
      this.buckets.set(clientId, bucket);
    }

    if (!bucket.consume(tokens)) {
      const available = bucket.getAvailableTokens();
      logger.warn({ clientId, available, required: tokens }, 'Rate limit exceeded');
      
      throw new MCPError(
        MCPErrorCode.RateLimitExceeded,
        'Rate limit exceeded. Please try again later.',
        { availableTokens: available, requiredTokens: tokens }
      );
    }
  }

  private cleanup(): void {
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

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.buckets.clear();
  }
}

export function createRateLimiter(): RateLimiter {
  const config: RateLimitConfig = {
    maxTokens: parseInt(process.env.RATE_LIMIT_TOKENS || '100', 10),
    refillRate: parseInt(process.env.RATE_LIMIT_REFILL_RATE || '10', 10),
    refillInterval: parseInt(process.env.RATE_LIMIT_REFILL_INTERVAL || '1000', 10),
  };

  logger.info({ config }, 'Rate limiter initialized');
  return new RateLimiter(config);
}
