/**
 * OpenTelemetry Setup
 * Provides distributed tracing, metrics, and logging
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { logger } from '../middleware/logging.js';

let sdk: NodeSDK | null = null;

export function initTelemetry(): void {
  if (process.env.OTEL_ENABLED !== 'true') {
    logger.info('OpenTelemetry disabled');
    return;
  }

  const serviceName = process.env.OTEL_SERVICE_NAME || 'mcp-server-template';

  sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  logger.info({ serviceName }, 'OpenTelemetry initialized');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await shutdownTelemetry();
  });
}

export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
      logger.info('OpenTelemetry shut down');
    } catch (error) {
      logger.error({ error }, 'Error shutting down OpenTelemetry');
    }
  }
}
