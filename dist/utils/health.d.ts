/**
 * Health Check Endpoint
 * Provides server health status and readiness checks
 */
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
declare class HealthMonitor {
    private checks;
    private startTime;
    private server?;
    registerCheck(name: string, fn: HealthCheckFn): void;
    getStatus(): Promise<HealthStatus>;
    startHTTPEndpoint(port?: number): void;
    stop(): Promise<void>;
}
export declare const healthMonitor: HealthMonitor;
export {};
//# sourceMappingURL=health.d.ts.map