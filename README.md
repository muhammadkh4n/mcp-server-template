# MCP Server Template

A production-ready Model Context Protocol (MCP) server template with TypeScript, featuring authentication, rate limiting, observability, and dual transport support (stdio + HTTP+SSE).

## Features

✨ **Production-Ready Architecture**
- TypeScript with strict mode
- ESM modules
- Comprehensive error handling
- Graceful shutdown with connection draining

🔐 **Authentication & Security**
- API key authentication
- OAuth2 support (extensible)
- Per-client rate limiting with token bucket algorithm

📊 **Observability**
- Structured logging with Pino
- OpenTelemetry integration
- Health check endpoints
- Request tracing

🚀 **Dual Transport Support**
- **stdio**: For local CLI usage
- **HTTP+SSE**: For web-based clients

🛠️ **Example Implementation**
- Tool examples with Zod validation
- Resource examples with caching
- Middleware patterns

## Quick Start

### Installation

```bash
cd ~/Projects/mcp-server-template
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key environment variables:
- `TRANSPORT`: `stdio` or `http`
- `PORT`: HTTP server port (default: 3000)
- `API_KEYS`: Comma-separated API keys for authentication
- `RATE_LIMIT_TOKENS`: Max tokens per bucket (default: 100)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `OTEL_ENABLED`: Enable OpenTelemetry (true/false)

### Build

```bash
npm run build
```

### Run

**Stdio mode** (for local usage):
```bash
npm run start:stdio
```

**HTTP+SSE mode** (for web clients):
```bash
npm run start:http
```

Or use the compiled binary directly:
```bash
node dist/index.js --transport=http --port=3000
```

## Project Structure

```
src/
├── index.ts              # Entry point with transport setup
├── server.ts             # MCP server configuration
├── middleware/
│   ├── auth.ts          # API key + OAuth2 middleware
│   ├── rateLimit.ts     # Token bucket rate limiter
│   └── logging.ts       # Pino structured logging
├── tools/
│   └── example.ts       # Example tools (echo, calculator)
├── resources/
│   └── example.ts       # Example resources with caching
└── utils/
    ├── errors.ts        # MCP error helpers
    ├── health.ts        # Health check system
    └── telemetry.ts     # OpenTelemetry setup
```

## API Reference

### Tools

#### `echo`
Echo a message back with optional transformations.

**Input:**
- `message` (string): Message to echo
- `uppercase` (boolean, optional): Convert to uppercase
- `repeat` (number, optional): Repeat count (1-10)

**Example:**
```json
{
  "message": "Hello, MCP!",
  "uppercase": true,
  "repeat": 2
}
```

#### `calculate`
Perform basic mathematical operations.

**Input:**
- `operation` (enum): `add`, `subtract`, `multiply`, `divide`
- `a` (number): First operand
- `b` (number): Second operand

**Example:**
```json
{
  "operation": "add",
  "a": 5,
  "b": 3
}
```

### Resources

#### `config://server/info`
Server configuration and runtime information (cached for 30s).

#### `time://current`
Current server time in ISO 8601 format.

### Health Endpoints

**HTTP mode only:**

- `GET /health` - Detailed health status
- `GET /healthz` - Same as /health
- `GET /ready` - Readiness probe
- `GET /sse` - SSE connection endpoint

## Development

### Watch mode
```bash
npm run dev
```

### Type checking
```bash
npm run typecheck
```

### Clean build artifacts
```bash
npm run clean
```

## Authentication

### API Key

Set `API_KEYS` in `.env`:
```
API_KEYS=key1,key2,key3
```

Clients must include:
```
Authorization: Bearer <api-key>
```

### OAuth2

Configure OAuth2 settings:
```
OAUTH2_CLIENT_ID=your-client-id
OAUTH2_CLIENT_SECRET=your-client-secret
OAUTH2_ISSUER_URL=https://your-issuer.com
```

**Note:** OAuth2 token validation is a placeholder. Implement JWT validation for production use.

## Rate Limiting

Token bucket algorithm with configurable parameters:

- `RATE_LIMIT_TOKENS`: Maximum tokens (default: 100)
- `RATE_LIMIT_REFILL_RATE`: Tokens added per interval (default: 10)
- `RATE_LIMIT_REFILL_INTERVAL`: Refill interval in ms (default: 1000)

Each request consumes 1 token. Rate limits are per-client (identified by API key or IP).

## Observability

### Logging

Structured JSON logs with Pino. Set `LOG_PRETTY=true` for development.

### OpenTelemetry

Enable with `OTEL_ENABLED=true` and configure exporter:

```
OTEL_SERVICE_NAME=mcp-server-template
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

Supports traces, metrics, and logs export via OTLP.

## Graceful Shutdown

The server handles `SIGINT` and `SIGTERM` gracefully:

1. Stop accepting new connections
2. Wait 2s for in-flight requests
3. Close MCP server
4. Cleanup resources (rate limiter, cache, telemetry)
5. Exit

## Error Handling

Standardized MCP error codes:

- `-32700`: Parse error
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid parameters
- `-32603`: Internal error
- `-32001`: Resource not found
- `-32002`: Resource unavailable
- `-32003`: Tool not found
- `-32004`: Tool execution error
- `-32005`: Authentication error
- `-32006`: Rate limit exceeded

## Extending the Server

### Add a Tool

1. Create a new file in `src/tools/`
2. Define Zod schema for input validation
3. Implement tool with `execute` method
4. Export and add to `tools` array in `src/tools/example.ts`

### Add a Resource

1. Create a new file in `src/resources/`
2. Define resource with `uri`, `name`, `description`, `mimeType`
3. Implement `read` method
4. Export and add to `resources` array in `src/resources/example.ts`

### Add Middleware

1. Create a new file in `src/middleware/`
2. Implement middleware logic
3. Hook into request handlers in `src/server.ts`

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- TypeScript strict mode compliance
- Proper error handling
- Tests for new features
- Documentation updates

---

**Built with:**
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/)
- [Pino](https://getpino.io/)
- [OpenTelemetry](https://opentelemetry.io/)
