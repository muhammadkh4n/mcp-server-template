/**
 * MCP Server Configuration & Tool Registration
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { AuthContext } from './middleware/auth.js';
import { RateLimiter } from './middleware/rateLimit.js';
export interface ServerContext {
    auth?: AuthContext;
}
export declare function createMCPServer(): {
    server: Server;
    rateLimiter: RateLimiter;
};
//# sourceMappingURL=server.d.ts.map