/**
 * Authentication Middleware
 * Supports API key and OAuth2 authentication
 */

import { logger } from './logging.js';
import { MCPError, MCPErrorCode } from '../utils/errors.js';

export interface AuthContext {
  clientId: string;
  authenticated: boolean;
  method: 'apikey' | 'oauth2' | 'none';
  claims?: Record<string, unknown>;
}

export class AuthMiddleware {
  private apiKeys: Set<string>;
  private oauth2Config?: {
    clientId: string;
    clientSecret: string;
    issuerUrl: string;
  };

  constructor() {
    // Load API keys from environment
    const apiKeysEnv = process.env.API_KEYS || '';
    this.apiKeys = new Set(
      apiKeysEnv.split(',').map(k => k.trim()).filter(k => k.length > 0)
    );

    // Load OAuth2 config if available
    if (process.env.OAUTH2_CLIENT_ID) {
      this.oauth2Config = {
        clientId: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET || '',
        issuerUrl: process.env.OAUTH2_ISSUER_URL || '',
      };
    }

    logger.info(
      { 
        apiKeysCount: this.apiKeys.size, 
        oauth2Enabled: !!this.oauth2Config 
      },
      'Auth middleware initialized'
    );
  }

  /**
   * Authenticate a request based on headers
   */
  authenticate(headers: Record<string, string | string[] | undefined>): AuthContext {
    // Check for API key in Authorization header
    const authHeader = headers['authorization'];
    
    if (authHeader) {
      const authValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      
      // API Key: "Bearer <key>"
      if (authValue?.startsWith('Bearer ')) {
        const token = authValue.slice(7);
        
        if (this.apiKeys.has(token)) {
          return {
            clientId: this.hashToken(token),
            authenticated: true,
            method: 'apikey',
          };
        }
        
        // OAuth2 token validation would go here
        if (this.oauth2Config) {
          // In production, validate JWT token against issuer
          // For now, we'll just accept it as a placeholder
          logger.warn('OAuth2 token validation not implemented');
        }
        
        throw new MCPError(
          MCPErrorCode.AuthenticationError,
          'Invalid authentication token'
        );
      }
    }

    // No authentication provided
    if (this.apiKeys.size > 0 || this.oauth2Config) {
      // Authentication is configured but not provided
      throw new MCPError(
        MCPErrorCode.AuthenticationError,
        'Authentication required. Provide a valid API key or OAuth2 token.'
      );
    }

    // No authentication configured - allow anonymous
    return {
      clientId: this.getAnonymousClientId(headers),
      authenticated: false,
      method: 'none',
    };
  }

  /**
   * Authenticate stdio transport (no HTTP headers)
   */
  authenticateStdio(): AuthContext {
    // For stdio, we typically trust the local process
    return {
      clientId: 'stdio-client',
      authenticated: true,
      method: 'none',
    };
  }

  private hashToken(token: string): string {
    // Simple hash for client ID (not cryptographic)
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `client-${Math.abs(hash).toString(16)}`;
  }

  private getAnonymousClientId(headers: Record<string, string | string[] | undefined>): string {
    // Use X-Forwarded-For or a random ID for anonymous clients
    const forwarded = headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    
    if (ip) {
      return `anon-${ip.replace(/[.:]/g, '-')}`;
    }
    
    return `anon-${Math.random().toString(36).slice(2)}`;
  }

  addApiKey(key: string): void {
    this.apiKeys.add(key);
    logger.info('API key added');
  }

  removeApiKey(key: string): void {
    this.apiKeys.delete(key);
    logger.info('API key removed');
  }
}

export const authMiddleware = new AuthMiddleware();
