/**
 * MCP Error Code Helpers
 * Standardized error handling for MCP protocol
 */
export var MCPErrorCode;
(function (MCPErrorCode) {
    // Standard JSON-RPC errors
    MCPErrorCode[MCPErrorCode["ParseError"] = -32700] = "ParseError";
    MCPErrorCode[MCPErrorCode["InvalidRequest"] = -32600] = "InvalidRequest";
    MCPErrorCode[MCPErrorCode["MethodNotFound"] = -32601] = "MethodNotFound";
    MCPErrorCode[MCPErrorCode["InvalidParams"] = -32602] = "InvalidParams";
    MCPErrorCode[MCPErrorCode["InternalError"] = -32603] = "InternalError";
    // MCP-specific errors
    MCPErrorCode[MCPErrorCode["ResourceNotFound"] = -32001] = "ResourceNotFound";
    MCPErrorCode[MCPErrorCode["ResourceUnavailable"] = -32002] = "ResourceUnavailable";
    MCPErrorCode[MCPErrorCode["ToolNotFound"] = -32003] = "ToolNotFound";
    MCPErrorCode[MCPErrorCode["ToolExecutionError"] = -32004] = "ToolExecutionError";
    MCPErrorCode[MCPErrorCode["AuthenticationError"] = -32005] = "AuthenticationError";
    MCPErrorCode[MCPErrorCode["RateLimitExceeded"] = -32006] = "RateLimitExceeded";
})(MCPErrorCode || (MCPErrorCode = {}));
export class MCPError extends Error {
    code;
    data;
    constructor(code, message, data) {
        super(message);
        this.code = code;
        this.data = data;
        this.name = 'MCPError';
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            data: this.data,
        };
    }
}
export function createError(code, message, data) {
    return new MCPError(code, message, data);
}
export function isAuthError(error) {
    return error instanceof MCPError && error.code === MCPErrorCode.AuthenticationError;
}
export function isRateLimitError(error) {
    return error instanceof MCPError && error.code === MCPErrorCode.RateLimitExceeded;
}
export function wrapToolError(error) {
    if (error instanceof MCPError) {
        return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return createError(MCPErrorCode.ToolExecutionError, `Tool execution failed: ${message}`, error instanceof Error ? { stack: error.stack } : undefined);
}
//# sourceMappingURL=errors.js.map