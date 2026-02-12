# MCP Gateway

> Route multiple MCP (Model Context Protocol) servers through a single gateway endpoint for Claude Code and other MCP-compatible clients.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.0.0-blue)](https://github.com/modelcontextprotocol/typescript-sdk)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Claude Code Integration](#claude-code-integration)
- [Usage Examples](#usage-examples)
- [Adding Your Own MCP Servers](#adding-your-own-mcp-servers)
- [Built-in Gateway Tools](#built-in-gateway-tools)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

MCP Gateway acts as a **unified proxy** that connects to multiple MCP servers and exposes all their tools through a single endpoint. Instead of configuring each MCP server separately in Claude Code, you configure them once in the gateway and connect Claude Code only to the gateway.

### Why Use MCP Gateway?

- **Centralized Management**: Configure all your MCP servers in one place
- **Namespace Isolation**: Tools are automatically prefixed to avoid naming conflicts
- **Auto-Reconnection**: Automatically reconnects to failed servers
- **Runtime Management**: Add, remove, or reconnect servers without restarting Claude Code
- **Simplified Setup**: One MCP connection instead of many

---

## Features

- 🔀 **Multi-Server Routing** - Connect to unlimited MCP servers simultaneously
- 🏷️ **Automatic Namespacing** - Tools are prefixed with server names (e.g., `github__create_issue`)
- 🔄 **Auto-Reconnect** - Automatically recovers from connection failures
- 📡 **Multiple Transports** - Supports both `stdio` and `HTTP/SSE` connections
- 🛠️ **Meta Tools** - Built-in tools to manage the gateway at runtime
- ⚙️ **Flexible Configuration** - JSON-based configuration with environment variable support
- 🔒 **Error Isolation** - One server's failure doesn't affect others

---

## Architecture

```
┌─────────────────┐
│   Claude Code   │
│   (MCP Host)    │
└────────┬────────┘
         │ stdio
         ▼
┌─────────────────────────────────────┐
│          MCP Gateway                │
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │ MCP Server  │  │ MCP Clients  │  │
│  │ (to Claude) │  │ (to backends)│  │
│  └─────────────┘  └───────┬──────┘  │
└───────────────────────────┼─────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
   ┌────────────┐    ┌────────────┐    ┌────────────┐
   │ GitHub MCP │    │ Database   │    │ Custom MCP │
   │   Server   │    │ MCP Server │    │   Server   │
   └────────────┘    └────────────┘    └────────────┘
```

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mcp-gateway-multiple.git
cd mcp-gateway-multiple

# Install dependencies
npm install

# Build the project
npm run build:all

# Run the gateway
npm start
```

---

## Installation

### Prerequisites

- **Node.js** v18.0.0 or higher (v22+ recommended)
- **npm** or **pnpm**
- **Claude Code** (for testing)

### From Source

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mcp-gateway-multiple.git
cd mcp-gateway-multiple

# Install dependencies
npm install

# Build everything (gateway + example servers)
npm run build:all
```

### From npm (Coming Soon)

```bash
npm install -g mcp-gateway-multiple
```

---

## Configuration

Create a `gateway.config.json` file in your project root:

```json
{
  "name": "my-gateway",
  "version": "1.0.0",
  "useNamespace": true,
  "logLevel": "info",
  "servers": [
    {
      "name": "echo",
      "transport": "stdio",
      "command": "node",
      "args": ["./examples/echo-server/build/index.js"],
      "enabled": true,
      "autoReconnect": true,
      "timeout": 5000
    }
  ]
}
```

### Configuration Options

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | - | Gateway name shown to clients |
| `version` | string | Yes | - | Gateway version |
| `useNamespace` | boolean | No | `true` | Prefix tool names with server name |
| `logLevel` | string | No | `"info"` | Log level: `debug`, `info`, `warn`, `error` |
| `servers` | array | Yes | - | List of MCP servers to connect |

### Server Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Server name (used as tool prefix) |
| `transport` | string | Yes | `"stdio"` or `"http"` |
| `command` | string | stdio only | Command to execute |
| `args` | string[] | No | Command arguments |
| `url` | string | http only | Server URL |
| `env` | object | No | Additional environment variables |
| `enabled` | boolean | No | Set `false` to disable (default: `true`) |
| `autoReconnect` | boolean | No | Auto-reconnect on failure (default: `true`) |
| `timeout` | number | No | Connection timeout in ms |

---

## Claude Code Integration

### Method 1: Project-specific Configuration

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "gateway": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-gateway-multiple/build/index.js"]
    }
  }
}
```

### Method 2: Global Configuration

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "gateway": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-gateway-multiple/build/index.js",
        "--config=/path/to/gateway.config.json"
      ]
    }
  }
}
```

### Method 3: Using npx (after npm publish)

```json
{
  "mcpServers": {
    "gateway": {
      "command": "npx",
      "args": ["-y", "mcp-gateway-multiple", "--config=./gateway.config.json"]
    }
  }
}
```

### Verify Connection

In Claude Code, run:

```
/mcp
```

You should see the gateway listed with all available tools.

---

## Usage Examples

Once connected, you can use any tool through Claude Code:

```
# List all connected servers
> Show me the gateway status
  (calls gateway__list_servers)

# Use echo server tools
> Echo "Hello World"
  (calls echo__echo)

# Use math server tools
> Calculate 5! (factorial)
  (calls math__factorial)

# Reconnect a failed server
> Reconnect to the echo server
  (calls gateway__reconnect with serverName: "echo")
```

---

## Adding Your Own MCP Servers

### Adding Existing MCP Servers

Add popular MCP servers to your `gateway.config.json`:

```json
{
  "servers": [
    {
      "name": "github",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    },
    {
      "name": "filesystem",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
    },
    {
      "name": "sqlite",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./database.sqlite"]
    },
    {
      "name": "brave-search",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-api-key"
      }
    }
  ]
}
```

### Creating a Custom MCP Server

Create a new TypeScript file:

```typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-custom-server",
  version: "1.0.0",
});

// Register your tools
server.tool(
  "my_tool",
  "Description of what this tool does",
  {
    param1: z.string().describe("First parameter"),
    param2: z.number().optional().describe("Optional second parameter"),
  },
  async ({ param1, param2 }) => ({
    content: [
      {
        type: "text",
        text: `Result: ${param1}, ${param2 ?? "default"}`,
      },
    ],
  })
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
```

Then add it to your gateway config:

```json
{
  "name": "custom",
  "transport": "stdio",
  "command": "node",
  "args": ["./path/to/my-custom-server.js"]
}
```

---

## Built-in Gateway Tools

The gateway provides meta tools for runtime management:

| Tool | Description |
|------|-------------|
| `gateway__list_servers` | List all connected servers and their status |
| `gateway__list_tools` | List all available tools across all servers |
| `gateway__reconnect` | Reconnect to a specific server |
| `gateway__status` | Show overall gateway status |

### Example Outputs

**gateway__list_servers:**
```json
[
  {
    "name": "echo",
    "status": "connected",
    "toolCount": 4,
    "tools": ["echo", "ping", "reverse", "uppercase"],
    "lastError": null
  },
  {
    "name": "math",
    "status": "connected",
    "toolCount": 7,
    "tools": ["add", "subtract", "multiply", "divide", "factorial", "power", "sqrt"],
    "lastError": null
  }
]
```

**gateway__status:**
```json
{
  "name": "mcp-gateway",
  "version": "1.0.0",
  "totalServers": 2,
  "connectedServers": 2,
  "totalTools": 11,
  "useNamespace": true
}
```

---

## Advanced Configuration

### Using Environment Variables

You can use environment variables in your configuration:

```json
{
  "servers": [
    {
      "name": "github",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  ]
}
```

Then set the environment variable:
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
npm start
```

### Disabling Namespace Prefixes

If you don't want tool names prefixed:

```json
{
  "useNamespace": false
}
```

⚠️ **Warning:** This may cause conflicts if multiple servers have tools with the same name.

### HTTP/SSE Transport

For remote MCP servers:

```json
{
  "name": "remote-server",
  "transport": "http",
  "url": "https://my-mcp-server.example.com/mcp"
}
```

### Multiple Configuration Files

Use different configs for different environments:

```bash
# Development
node build/index.js --config=./config/dev.json

# Production
node build/index.js --config=./config/prod.json
```

### Config File Search Order

The gateway searches for configuration in this order:
1. `--config=` command line argument
2. `./gateway.config.json` (current directory)
3. `./.mcp-gateway.json` (current directory)
4. `~/.mcp-gateway.json` (home directory)

---

## Troubleshooting

### Common Issues

**"MCP server disconnected" error:**
```bash
# Test the gateway directly
node build/index.js

# Check if example servers are built
npm run build:examples
```

**Tools not appearing:**
```bash
# Check server status using the meta tool
# In Claude Code:
> List gateway servers
```

**"Cannot find module" error:**
```bash
# Rebuild the project
npm run clean
npm run build:all
```

**Connection timeout:**
- Increase `timeout` value in server config
- Check if the MCP server is actually running
- Verify the command and arguments are correct

### Debug Mode

Enable debug logging:

```json
{
  "logLevel": "debug"
}
```

Or run with log output:
```bash
node build/index.js 2>gateway.log
tail -f gateway.log
```

### Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

This opens a web UI to test all tools interactively.

---

## Project Structure

```
mcp-gateway-multiple/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── gateway.ts            # Main gateway class
│   ├── connection-manager.ts # Server connection handling
│   ├── config.ts             # Configuration loader
│   └── types.ts              # TypeScript definitions
├── examples/
│   ├── echo-server/          # Example echo MCP server
│   └── math-server/          # Example math MCP server
├── build/                    # Compiled JavaScript
├── gateway.config.json       # Default configuration
├── package.json
└── tsconfig.json
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the gateway |
| `npm run build:examples` | Build example servers |
| `npm run build:all` | Build everything |
| `npm run dev` | Run with tsx (development) |
| `npm start` | Run compiled gateway |
| `npm run clean` | Remove build artifacts |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol specification
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - Official SDK
- [Claude Code](https://claude.ai/code) - AI coding assistant

---

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search [existing issues](https://github.com/YOUR_USERNAME/mcp-gateway-multiple/issues)
3. Open a [new issue](https://github.com/YOUR_USERNAME/mcp-gateway-multiple/issues/new)

---

<p align="center">
  Made with ❤️ for the MCP community
</p>
