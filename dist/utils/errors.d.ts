/**
 * MCP Error Code Helpers
 * Standardized error handling for MCP protocol
 */
export declare enum MCPErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
    ResourceNotFound = -32001,
    ResourceUnavailable = -32002,
    ToolNotFound = -32003,
    ToolExecutionError = -32004,
    AuthenticationError = -32005,
    RateLimitExceeded = -32006
}
export declare class MCPError extends Error {
    code: MCPErrorCode;
    data?: unknown | undefined;
    constructor(code: MCPErrorCode, message: string, data?: unknown | undefined);
    toJSON(): {
        code: MCPErrorCode;
        message: string;
        data: unknown;
    };
}
export declare function createError(code: MCPErrorCode, message: string, data?: unknown): MCPError;
export declare function isAuthError(error: unknown): boolean;
export declare function isRateLimitError(error: unknown): boolean;
export declare function wrapToolError(error: unknown): MCPError;
//# sourceMappingURL=errors.d.ts.map