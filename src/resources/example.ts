/**
 * Example Resource with Caching
 */

import { logger } from '../middleware/logging.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ResourceCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.debug({ removed, remaining: this.cache.size }, 'Cleaned up resource cache');
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

const cache = new ResourceCache();

export const configResource = {
  uri: 'config://server/info',
  name: 'Server Configuration',
  description: 'Server configuration and runtime information',
  mimeType: 'application/json',
  
  async read(): Promise<{ contents: Array<{ uri: string; mimeType?: string; text: string }> }> {
    const cacheKey = 'config:server:info';
    let config = cache.get<Record<string, unknown>>(cacheKey);

    if (!config) {
      logger.info('Fetching server configuration (cache miss)');
      
      config = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development',
        pid: process.pid,
      };

      // Cache for 30 seconds
      cache.set(cacheKey, config, 30000);
    } else {
      logger.debug('Returning cached server configuration');
    }

    return {
      contents: [
        {
          uri: 'config://server/info',
          mimeType: 'application/json',
          text: JSON.stringify(config, null, 2),
        },
      ],
    };
  },
};

export const timestampResource = {
  uri: 'time://current',
  name: 'Current Timestamp',
  description: 'Current server time in ISO 8601 format',
  mimeType: 'text/plain',
  
  async read(): Promise<{ contents: Array<{ uri: string; mimeType?: string; text: string }> }> {
    const now = new Date().toISOString();
    
    logger.info({ timestamp: now }, 'Fetching current timestamp');

    return {
      contents: [
        {
          uri: 'time://current',
          mimeType: 'text/plain',
          text: now,
        },
      ],
    };
  },
};

export const resources = [configResource, timestampResource];

export function destroyResourceCache(): void {
  cache.destroy();
}
