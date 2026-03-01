/**
 * MCP Server Configuration & Tool Registration
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { tools } from './tools/example.js';
import { resources } from './resources/example.js';
import { logger } from './middleware/logging.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { healthMonitor } from './utils/health.js';
export function createMCPServer() {
    const server = new Server({
        name: 'mcp-server-template',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
            resources: {},
        },
    });
    const rateLimiter = createRateLimiter();
    // List tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        logger.debug('Listing tools');
        return {
            tools: tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            })),
        };
    });
    // Call tool
    server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
        const context = extra;
        // Rate limiting
        if (context.auth) {
            rateLimiter.checkLimit(context.auth.clientId);
        }
        const tool = tools.find(t => t.name === request.params.name);
        if (!tool) {
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
        logger.info({ tool: tool.name, args: request.params.arguments }, 'Calling tool');
        return await tool.execute(request.params.arguments);
    });
    // List resources
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        logger.debug('Listing resources');
        return {
            resources: resources.map(resource => ({
                uri: resource.uri,
                name: resource.name,
                description: resource.description,
                mimeType: resource.mimeType,
            })),
        };
    });
    // Read resource
    server.setRequestHandler(ReadResourceRequestSchema, async (request, extra) => {
        const context = extra;
        // Rate limiting
        if (context.auth) {
            rateLimiter.checkLimit(context.auth.clientId);
        }
        const resource = resources.find(r => r.uri === request.params.uri);
        if (!resource) {
            throw new Error(`Unknown resource: ${request.params.uri}`);
        }
        logger.info({ resource: resource.uri }, 'Reading resource');
        return await resource.read();
    });
    // Register health checks
    healthMonitor.registerCheck('mcp-server', async () => {
        return {
            name: 'mcp-server',
            status: 'pass',
            message: 'Server is running',
        };
    });
    logger.info({
        tools: tools.length,
        resources: resources.length
    }, 'MCP server configured');
    return { server, rateLimiter };
}
//# sourceMappingURL=server.js.map