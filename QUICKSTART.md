# MCP Server Template - Quick Start

## ✅ Project Status

The template is **fully functional and production-ready**!

- ✅ TypeScript compilation successful
- ✅ All dependencies installed
- ✅ Server tested and running
- ✅ Graceful shutdown working
- ✅ Dual transport support (stdio + HTTP+SSE)

## 🚀 Getting Started

### 1. Navigate to the project
```bash
cd ~/Projects/mcp-server-template
```

### 2. Review configuration
```bash
cat .env.example
```

Optionally copy to `.env` and customize:
```bash
cp .env.example .env
```

### 3. Build (already done, but to rebuild)
```bash
npm run build
```

### 4. Run the server

**Stdio mode** (for MCP clients like Claude Desktop):
```bash
npm run start:stdio
```

**HTTP+SSE mode** (for web clients):
```bash
npm run start:http
```

Or with custom port:
```bash
node dist/index.js --transport=http --port=3456
```

## 📦 What's Included

### Core Features
- ✅ TypeScript with strict mode
- ✅ ESM modules
- ✅ Dual transport (stdio + HTTP+SSE)
- ✅ API key authentication
- ✅ Token bucket rate limiting
- ✅ Structured logging (Pino)
- ✅ OpenTelemetry integration
- ✅ Health check endpoints
- ✅ Graceful shutdown
- ✅ Connection draining

### Example Tools (src/tools/example.ts)
1. **echo** - Echo messages with optional uppercase and repeat
2. **calculate** - Basic math operations (add, subtract, multiply, divide)

### Example Resources (src/resources/example.ts)
1. **config://server/info** - Server runtime info (cached 30s)
2. **time://current** - Current ISO timestamp

### Middleware (src/middleware/)
- **auth.ts** - API key + OAuth2 authentication
- **rateLimit.ts** - Token bucket rate limiter
- **logging.ts** - Pino structured logging

### Utilities (src/utils/)
- **errors.ts** - MCP error code helpers
- **health.ts** - Health check system
- **telemetry.ts** - OpenTelemetry setup

## 🧪 Testing

### Test HTTP mode with health check
```bash
# Start server
npm run start:http

# In another terminal
curl http://localhost:3000/health
```

### Test tools via MCP client
Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mcp-server-template": {
      "command": "node",
      "args": [
        "/Users/muhammadkh4n/Projects/mcp-server-template/dist/index.js",
        "--transport=stdio"
      ]
    }
  }
}
```

## 📝 Next Steps

1. **Add your own tools** in `src/tools/`
2. **Add resources** in `src/resources/`
3. **Configure authentication** in `.env`
4. **Enable observability** with OpenTelemetry
5. **Deploy** to production

## 📊 Verified Functionality

```
✅ Auth middleware initialized
✅ Rate limiter initialized (100 tokens, refill 10/sec)
✅ MCP server configured (2 tools, 2 resources)
✅ HTTP server listening on port 3456
✅ SSE endpoint ready at /sse
✅ Health check endpoint ready at /health
✅ Graceful shutdown working
```

## 🛠️ Development Commands

```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# Type check only (no compilation)
npm run typecheck

# Clean build artifacts
npm run clean

# Rebuild from scratch
npm run clean && npm run build
```

## 🔒 Security Notes

- Set `API_KEYS` in production for authentication
- Configure rate limits based on your use case
- Enable OTEL for production monitoring
- Review CORS settings in `src/index.ts` for HTTP mode

## 📚 Documentation

See [README.md](./README.md) for full documentation.

---

**Template built and tested successfully! 🎉**
