#!/usr/bin/env node
/**
 * MCP Server Template - Entry Point
 * Supports both stdio and HTTP+SSE transports
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { config } from 'dotenv';
import { createMCPServer } from './server.js';
import { logger } from './middleware/logging.js';
import { authMiddleware } from './middleware/auth.js';
import { healthMonitor } from './utils/health.js';
import { initTelemetry, shutdownTelemetry } from './utils/telemetry.js';
import { destroyResourceCache } from './resources/example.js';

// Load environment variables
config();

// Initialize telemetry
initTelemetry();

// Parse command line arguments
const args = process.argv.slice(2);
const transportArg = args.find(arg => arg.startsWith('--transport='));
const portArg = args.find(arg => arg.startsWith('--port='));

const transport = transportArg?.split('=')[1] || process.env.TRANSPORT || 'stdio';
const port = parseInt(portArg?.split('=')[1] || process.env.PORT || '3000', 10);

const { server: mcpServer, rateLimiter } = createMCPServer();

let httpServer: ReturnType<typeof createServer> | null = null;
let isShuttingDown = false;

async function startStdioTransport() {
  logger.info('Starting MCP server with stdio transport');
  
  const transport = new StdioServerTransport();
  
  await mcpServer.connect(transport);
  
  logger.info('MCP server running on stdio');
}

async function startHTTPTransport(port: number) {
  logger.info({ port }, 'Starting MCP server with HTTP+SSE transport');

  httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Health check endpoint
    if (req.url === '/health' || req.url === '/healthz') {
      const status = await healthMonitor.getStatus();
      const statusCode = status.status === 'healthy' ? 200 : 503;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status, null, 2));
      return;
    }

    // SSE endpoint
    if (req.url === '/sse' && req.method === 'GET') {
      try {
        // Authenticate request
        const headers = req.headers as Record<string, string | string[] | undefined>;
        const authContext = authMiddleware.authenticate(headers);
        
        logger.info({ clientId: authContext.clientId, method: authContext.method }, 'SSE connection established');

        const transport = new SSEServerTransport('/message', res);
        await mcpServer.connect(transport);
      } catch (error) {
        logger.error({ error }, 'SSE connection failed');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Authentication failed' }));
      }
      return;
    }

    // Message endpoint (for SSE)
    if (req.url === '/message' && req.method === 'POST') {
      // This is handled by SSEServerTransport
      return;
    }

    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  httpServer.listen(port, () => {
    logger.info({ port }, 'HTTP server listening');
    logger.info({ url: `http://localhost:${port}/sse` }, 'SSE endpoint ready');
    logger.info({ url: `http://localhost:${port}/health` }, 'Health check endpoint ready');
  });
}

// Graceful shutdown
async function shutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress');
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, 'Shutting down gracefully');

  // Stop accepting new connections
  if (httpServer) {
    httpServer.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Give existing connections time to finish
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Cleanup
  try {
    await mcpServer.close();
    logger.info('MCP server closed');
  } catch (error) {
    logger.error({ error }, 'Error closing MCP server');
  }

  try {
    rateLimiter.destroy();
    logger.info('Rate limiter destroyed');
  } catch (error) {
    logger.error({ error }, 'Error destroying rate limiter');
  }

  try {
    destroyResourceCache();
    logger.info('Resource cache destroyed');
  } catch (error) {
    logger.error({ error }, 'Error destroying resource cache');
  }

  try {
    await healthMonitor.stop();
    logger.info('Health monitor stopped');
  } catch (error) {
    logger.error({ error }, 'Error stopping health monitor');
  }

  try {
    await shutdownTelemetry();
  } catch (error) {
    logger.error({ error }, 'Error shutting down telemetry');
  }

  logger.info('Shutdown complete');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Unhandled errors
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  shutdown('unhandledRejection');
});

// Start server
async function main() {
  try {
    if (transport === 'stdio') {
      await startStdioTransport();
    } else if (transport === 'http' || transport === 'sse') {
      await startHTTPTransport(port);
    } else {
      logger.error({ transport }, 'Invalid transport. Use stdio or http');
      process.exit(1);
    }
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

main();
