/**
 * Health Check Endpoint
 * Provides server health status and readiness checks
 */

import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { logger } from '../middleware/logging.js';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  duration?: number;
}

type HealthCheckFn = () => Promise<HealthCheck>;

class HealthMonitor {
  private checks: Map<string, HealthCheckFn> = new Map();
  private startTime: number = Date.now();
  private server?: ReturnType<typeof createServer>;

  registerCheck(name: string, fn: HealthCheckFn): void {
    this.checks.set(name, fn);
  }

  async getStatus(): Promise<HealthStatus> {
    const checkResults: HealthCheck[] = [];
    
    for (const [name, fn] of this.checks.entries()) {
      try {
        const start = Date.now();
        const result = await fn();
        result.duration = Date.now() - start;
        checkResults.push(result);
      } catch (error) {
        checkResults.push({
          name,
          status: 'fail',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const failedChecks = checkResults.filter(c => c.status === 'fail');
    const warnChecks = checkResults.filter(c => c.status === 'warn');

    return {
      status: failedChecks.length > 0 ? 'unhealthy' : warnChecks.length > 0 ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      checks: checkResults,
    };
  }

  startHTTPEndpoint(port: number = 8080): void {
    this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      if (req.url === '/health' || req.url === '/healthz') {
        const status = await this.getStatus();
        const statusCode = status.status === 'healthy' ? 200 : status.status === 'degraded' ? 200 : 503;
        
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status, null, 2));
      } else if (req.url === '/ready' || req.url === '/readyz') {
        const status = await this.getStatus();
        const ready = status.status !== 'unhealthy';
        
        res.writeHead(ready ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ready, status: status.status }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    this.server.listen(port, () => {
      logger.info({ port }, 'Health check endpoint listening');
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve, reject) => {
        this.server!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}

export const healthMonitor = new HealthMonitor();

// Default checks
healthMonitor.registerCheck('memory', async () => {
  const usage = process.memoryUsage();
  const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;
  
  return {
    name: 'memory',
    status: heapUsedPercent > 90 ? 'warn' : 'pass',
    message: `Heap: ${Math.round(heapUsedPercent)}% used`,
  };
});

healthMonitor.registerCheck('eventLoop', async () => {
  const start = Date.now();
  await new Promise(resolve => setImmediate(resolve));
  const lag = Date.now() - start;
  
  return {
    name: 'eventLoop',
    status: lag > 100 ? 'warn' : 'pass',
    message: `Event loop lag: ${lag}ms`,
  };
});
