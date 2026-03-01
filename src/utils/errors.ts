/**
 * MCP Error Code Helpers
 * Standardized error handling for MCP protocol
 */

export enum MCPErrorCode {
  // Standard JSON-RPC errors
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  
  // MCP-specific errors
  ResourceNotFound = -32001,
  ResourceUnavailable = -32002,
  ToolNotFound = -32003,
  ToolExecutionError = -32004,
  AuthenticationError = -32005,
  RateLimitExceeded = -32006,
}

export class MCPError extends Error {
  constructor(
    public code: MCPErrorCode,
    message: string,
    public data?: unknown
  ) {
    super(message);
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

export function createError(
  code: MCPErrorCode,
  message: string,
  data?: unknown
): MCPError {
  return new MCPError(code, message, data);
}

export function isAuthError(error: unknown): boolean {
  return error instanceof MCPError && error.code === MCPErrorCode.AuthenticationError;
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof MCPError && error.code === MCPErrorCode.RateLimitExceeded;
}

export function wrapToolError(error: unknown): MCPError {
  if (error instanceof MCPError) {
    return error;
  }
  
  const message = error instanceof Error ? error.message : String(error);
  return createError(
    MCPErrorCode.ToolExecutionError,
    `Tool execution failed: ${message}`,
    error instanceof Error ? { stack: error.stack } : undefined
  );
}
