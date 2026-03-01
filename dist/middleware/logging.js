/**
 * Structured Logging with Pino
 */
import pino from 'pino';
const isDev = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || 'info';
const usePretty = process.env.LOG_PRETTY === 'true' || isDev;
export const logger = pino({
    level: logLevel,
    transport: usePretty
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});
export function createRequestLogger(requestId) {
    return logger.child({ requestId });
}
//# sourceMappingURL=logging.js.map