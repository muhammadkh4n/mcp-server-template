/**
 * Authentication Middleware
 * Supports API key and OAuth2 authentication
 */
export interface AuthContext {
    clientId: string;
    authenticated: boolean;
    method: 'apikey' | 'oauth2' | 'none';
    claims?: Record<string, unknown>;
}
export declare class AuthMiddleware {
    private apiKeys;
    private oauth2Config?;
    constructor();
    /**
     * Authenticate a request based on headers
     */
    authenticate(headers: Record<string, string | string[] | undefined>): AuthContext;
    /**
     * Authenticate stdio transport (no HTTP headers)
     */
    authenticateStdio(): AuthContext;
    private hashToken;
    private getAnonymousClientId;
    addApiKey(key: string): void;
    removeApiKey(key: string): void;
}
export declare const authMiddleware: AuthMiddleware;
//# sourceMappingURL=auth.d.ts.map