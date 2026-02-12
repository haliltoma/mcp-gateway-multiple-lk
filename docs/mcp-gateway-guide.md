# MCP Gateway Projesi: Kapsamlı Geliştirme Rehberi

> Birden fazla MCP sunucusunu tek bir noktadan yöneten, Claude Code ile entegre çalışan bir MCP Gateway oluşturma rehberi.

---

## İçindekiler

1. [Proje Mimarisi](#1-proje-mimarisi)
2. [Geliştirme Ortamının Hazırlanması](#2-geliştirme-ortamının-hazırlanması)
3. [Proje İskeleti](#3-proje-iskeleti)
4. [Gateway Çekirdek Kodları](#4-gateway-çekirdek-kodları)
5. [Konfigürasyon Sistemi](#5-konfigürasyon-sistemi)
6. [Alt MCP Sunucularına Bağlantı](#6-alt-mcp-sunucularına-bağlantı)
7. [Tool Proxy Mekanizması](#7-tool-proxy-mekanizması)
8. [Hata Yönetimi ve Reconnect](#8-hata-yönetimi-ve-reconnect)
9. [Test İçin Örnek MCP Sunucuları](#9-test-için-örnek-mcp-sunucuları)
10. [GitHub'a Yayınlama](#10-githuba-yayınlama)
11. [Claude Code ile Bağlantı ve Test](#11-claude-code-ile-bağlantı-ve-test)
12. [npx ile Global Kullanım](#12-npx-ile-global-kullanım)
13. [İleri Seviye Özellikler](#13-ileri-seviye-özellikler)
14. [Sorun Giderme](#14-sorun-giderme)

---

## 1. Proje Mimarisi

### Genel Görünüm

```
┌─────────────┐
│ Claude Code  │
│  (MCP Host)  │
└──────┬───────┘
       │ stdio
       ▼
┌──────────────────────────────────┐
│      MCP Gateway (Senin Projen)  │
│                                  │
│  ┌────────────┐ ┌─────────────┐  │
│  │ MCP Server │ │ MCP Clients │  │
│  │ (Claude'a  │ │ (Alt MCP'lere│  │
│  │  hizmet)   │ │  bağlanır)  │  │
│  └────────────┘ └──────┬──────┘  │
└─────────────────────────┼────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │ GitHub MCP │  │  DB MCP    │  │ Custom MCP │
   │  Server    │  │  Server    │  │  Server    │
   └────────────┘  └────────────┘  └────────────┘
```

### Çalışma Prensibi

Gateway aynı anda iki rol üstlenir. Claude Code'a karşı bir **MCP Server** gibi davranır ve stdio üzerinden iletişim kurar. Aynı zamanda arkadaki MCP sunucularına **MCP Client** olarak bağlanır. Bir tool çağrısı geldiğinde, ilgili alt MCP'ye yönlendirir ve sonucu Claude Code'a geri iletir.

---

## 2. Geliştirme Ortamının Hazırlanması

### Gereksinimler

- **Node.js** v18+ (tercihen v22+)
- **npm** veya **pnpm**
- **TypeScript** v5+
- **Git**
- **Claude Code** (test için)

### Node.js Kurulumu (yoksa)

```bash
# nvm ile kurulum (önerilen)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use 22
node --version  # v22.x.x olmalı
```

---

## 3. Proje İskeleti

### Proje Oluşturma

```bash
mkdir mcp-gateway
cd mcp-gateway
npm init -y
```

### Bağımlılıkları Yükleme

```bash
# Ana bağımlılıklar
npm install @modelcontextprotocol/sdk zod@3

# Geliştirme bağımlılıkları
npm install -D typescript @types/node tsx
```

### Dosya Yapısı

```
mcp-gateway/
├── src/
│   ├── index.ts              # Ana giriş noktası
│   ├── gateway.ts            # Gateway çekirdek sınıfı
│   ├── connection-manager.ts # Alt MCP bağlantı yöneticisi
│   ├── tool-registry.ts      # Tool kayıt ve proxy sistemi
│   ├── config.ts             # Konfigürasyon yükleyici
│   └── types.ts              # TypeScript tip tanımları
├── examples/
│   ├── echo-server/          # Test için basit MCP sunucusu
│   │   └── index.ts
│   └── math-server/          # Test için matematik MCP sunucusu
│       └── index.ts
├── gateway.config.json       # Gateway konfigürasyon dosyası
├── tsconfig.json
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "examples"]
}
```

### package.json Güncellemesi

```json
{
  "name": "mcp-gateway",
  "version": "1.0.0",
  "description": "MCP Gateway - Birden fazla MCP sunucusunu tek noktadan yönet",
  "type": "module",
  "bin": {
    "mcp-gateway": "./build/index.js"
  },
  "scripts": {
    "build": "tsc && chmod 755 build/index.js",
    "dev": "tsx src/index.ts",
    "start": "node build/index.js",
    "build:examples": "tsx examples/echo-server/index.ts",
    "clean": "rm -rf build",
    "prepublishOnly": "npm run build"
  },
  "files": ["build"],
  "keywords": ["mcp", "gateway", "proxy", "claude", "ai"],
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 4. Gateway Çekirdek Kodları

### src/types.ts

```typescript
export interface ServerConfig {
  /** Sunucu adı — tool prefix'i olarak kullanılır */
  name: string;

  /** Bağlantı türü */
  transport: "stdio" | "http";

  /** HTTP bağlantı için URL */
  url?: string;

  /** stdio bağlantı için komut */
  command?: string;

  /** stdio bağlantı için argümanlar */
  args?: string[];

  /** Ortam değişkenleri */
  env?: Record<string, string>;

  /** Otomatik yeniden bağlanma */
  autoReconnect?: boolean;

  /** Bağlantı zaman aşımı (ms) */
  timeout?: number;

  /** Bu sunucu aktif mi? */
  enabled?: boolean;
}

export interface GatewayConfig {
  /** Gateway adı */
  name: string;

  /** Gateway versiyonu */
  version: string;

  /** Bağlanılacak MCP sunucuları */
  servers: ServerConfig[];

  /** Tool isimlerini namespace ile prefixle */
  useNamespace?: boolean;

  /** Genel log seviyesi */
  logLevel?: "debug" | "info" | "warn" | "error";
}

export interface ConnectedServer {
  config: ServerConfig;
  client: any; // MCP Client instance
  transport: any; // Transport instance
  tools: ToolInfo[];
  status: "connected" | "disconnected" | "connecting" | "error";
  lastError?: string;
}

export interface ToolInfo {
  /** Orijinal tool adı */
  originalName: string;

  /** Gateway üzerindeki adı (namespace dahil) */
  gatewayName: string;

  /** Tool açıklaması */
  description: string;

  /** Input şeması */
  inputSchema: any;

  /** Hangi sunucuya ait */
  serverName: string;
}
```

### src/config.ts

```typescript
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { GatewayConfig } from "./types.js";

const DEFAULT_CONFIG: GatewayConfig = {
  name: "mcp-gateway",
  version: "1.0.0",
  servers: [],
  useNamespace: true,
  logLevel: "info",
};

export function loadConfig(configPath?: string): GatewayConfig {
  // 1. Komut satırı argümanından config path
  const pathArg = configPath || process.argv.find((a) => a.startsWith("--config="))?.split("=")[1];

  // 2. Varsayılan konumları dene
  const candidates = [
    pathArg,
    resolve(process.cwd(), "gateway.config.json"),
    resolve(process.cwd(), ".mcp-gateway.json"),
    resolve(process.env.HOME || "~", ".mcp-gateway.json"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      try {
        const raw = readFileSync(candidate, "utf-8");
        const parsed = JSON.parse(raw);
        log("info", `Config yüklendi: ${candidate}`);
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch (err) {
        log("error", `Config parse hatası (${candidate}): ${err}`);
      }
    }
  }

  log("warn", "Config dosyası bulunamadı, varsayılan ayarlar kullanılıyor.");
  return DEFAULT_CONFIG;
}

export function log(level: string, message: string): void {
  // MCP stdio üzerinde çalıştığı için logları stderr'e yaz
  const timestamp = new Date().toISOString();
  process.stderr.write(`[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
}
```

### src/connection-manager.ts

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { ServerConfig, ConnectedServer, ToolInfo } from "./types.js";
import { log } from "./config.js";

export class ConnectionManager {
  private servers: Map<string, ConnectedServer> = new Map();

  /**
   * Bir MCP sunucusuna bağlan ve tool'larını keşfet
   */
  async connect(config: ServerConfig): Promise<ConnectedServer> {
    if (config.enabled === false) {
      log("info", `[${config.name}] Devre dışı, atlanıyor.`);
      return {
        config,
        client: null,
        transport: null,
        tools: [],
        status: "disconnected",
      };
    }

    log("info", `[${config.name}] Bağlanılıyor...`);

    const client = new Client(
      { name: `gateway-client-${config.name}`, version: "1.0.0" },
      { capabilities: {} }
    );

    let transport: any;

    try {
      if (config.transport === "stdio") {
        if (!config.command) {
          throw new Error(`[${config.name}] stdio transport için 'command' gerekli`);
        }
        transport = new StdioClientTransport({
          command: config.command,
          args: config.args || [],
          env: { ...process.env, ...(config.env || {}) } as Record<string, string>,
        });
      } else if (config.transport === "http") {
        if (!config.url) {
          throw new Error(`[${config.name}] http transport için 'url' gerekli`);
        }
        transport = new StreamableHTTPClientTransport(new URL(config.url));
      } else {
        throw new Error(`[${config.name}] Bilinmeyen transport: ${config.transport}`);
      }

      await client.connect(transport);
      log("info", `[${config.name}] Bağlantı başarılı.`);

      // Tool'ları keşfet
      const tools = await this.discoverTools(client, config.name);
      log("info", `[${config.name}] ${tools.length} tool keşfedildi.`);

      const connected: ConnectedServer = {
        config,
        client,
        transport,
        tools,
        status: "connected",
      };

      this.servers.set(config.name, connected);
      return connected;
    } catch (err: any) {
      log("error", `[${config.name}] Bağlantı hatası: ${err.message}`);

      const failed: ConnectedServer = {
        config,
        client: null,
        transport: null,
        tools: [],
        status: "error",
        lastError: err.message,
      };

      this.servers.set(config.name, failed);
      return failed;
    }
  }

  /**
   * Bağlı MCP sunucusundan tool listesini al
   */
  private async discoverTools(client: Client, serverName: string): Promise<ToolInfo[]> {
    const result = await client.listTools();

    return (result.tools || []).map((tool: any) => ({
      originalName: tool.name,
      gatewayName: `${serverName}__${tool.name}`, // namespace separator
      description: tool.description || "",
      inputSchema: tool.inputSchema || { type: "object", properties: {} },
      serverName,
    }));
  }

  /**
   * Belirli bir sunucudaki tool'u çağır
   */
  async callTool(serverName: string, toolName: string, args: any): Promise<any> {
    const server = this.servers.get(serverName);

    if (!server || server.status !== "connected") {
      throw new Error(`Sunucu bağlı değil: ${serverName}`);
    }

    try {
      const result = await server.client.callTool({
        name: toolName,
        arguments: args,
      });
      return result;
    } catch (err: any) {
      log("error", `[${serverName}] Tool çağrı hatası (${toolName}): ${err.message}`);

      // Reconnect dene
      if (server.config.autoReconnect !== false) {
        log("info", `[${serverName}] Yeniden bağlanma deneniyor...`);
        await this.reconnect(serverName);
      }

      throw err;
    }
  }

  /**
   * Sunucuya yeniden bağlan
   */
  async reconnect(serverName: string): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server) return;

    try {
      if (server.client) {
        await server.client.close().catch(() => {});
      }
    } catch {}

    await this.connect(server.config);
  }

  /**
   * Tüm bağlı sunucuları getir
   */
  getAll(): Map<string, ConnectedServer> {
    return this.servers;
  }

  /**
   * Tüm bağlantıları kapat
   */
  async disconnectAll(): Promise<void> {
    for (const [name, server] of this.servers) {
      try {
        if (server.client) {
          await server.client.close();
          log("info", `[${name}] Bağlantı kapatıldı.`);
        }
      } catch (err: any) {
        log("error", `[${name}] Kapatma hatası: ${err.message}`);
      }
    }
    this.servers.clear();
  }
}
```

### src/gateway.ts

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ConnectionManager } from "./connection-manager.js";
import { loadConfig, log } from "./config.js";
import type { GatewayConfig, ToolInfo } from "./types.js";

export class MCPGateway {
  private server: McpServer;
  private connectionManager: ConnectionManager;
  private config: GatewayConfig;
  private registeredTools: Map<string, ToolInfo> = new Map();

  constructor(configPath?: string) {
    this.config = loadConfig(configPath);
    this.connectionManager = new ConnectionManager();
    this.server = new McpServer({
      name: this.config.name,
      version: this.config.version,
    });

    this.registerMetaTools();
  }

  /**
   * Gateway'i başlat: alt MCP'lere bağlan ve tool'ları kaydet
   */
  async start(): Promise<void> {
    log("info", `🚀 ${this.config.name} v${this.config.version} başlatılıyor...`);
    log("info", `📡 ${this.config.servers.length} sunucu yapılandırılmış.`);

    // Alt MCP sunucularına bağlan
    for (const serverConfig of this.config.servers) {
      const connected = await this.connectionManager.connect(serverConfig);

      if (connected.status === "connected") {
        // Keşfedilen tool'ları gateway üzerinde kaydet
        for (const tool of connected.tools) {
          this.registerProxyTool(tool);
        }
      }
    }

    log("info", `✅ Toplam ${this.registeredTools.size} tool kaydedildi.`);

    // Claude Code'a stdio üzerinden sun
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    log("info", "🔗 Gateway hazır, Claude Code bağlantısı bekleniyor...");
  }

  /**
   * Alt MCP'den gelen tool'u gateway üzerinde proxy olarak kaydet
   */
  private registerProxyTool(tool: ToolInfo): void {
    const toolName = this.config.useNamespace !== false
      ? tool.gatewayName
      : tool.originalName;

    // Zod şemasına dönüştürmek yerine ham JSON Schema kabul et
    // McpServer.tool() raw schema da kabul eder
    this.server.tool(
      toolName,
      `[${tool.serverName}] ${tool.description}`,
      tool.inputSchema.properties
        ? Object.fromEntries(
            Object.entries(tool.inputSchema.properties).map(([key, schema]: [string, any]) => {
              return [key, jsonSchemaToZod(schema)];
            })
          )
        : {},
      async (params: any) => {
        try {
          const result = await this.connectionManager.callTool(
            tool.serverName,
            tool.originalName,
            params
          );

          return result;
        } catch (err: any) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Hata: [${tool.serverName}/${tool.originalName}] ${err.message}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    this.registeredTools.set(toolName, tool);
    log("debug", `  📎 Tool kaydedildi: ${toolName}`);
  }

  /**
   * Gateway yönetim tool'larını kaydet
   */
  private registerMetaTools(): void {
    // Bağlı sunucuları listele
    this.server.tool(
      "gateway__list_servers",
      "Bağlı MCP sunucularını ve durumlarını listeler",
      {},
      async () => {
        const servers = this.connectionManager.getAll();
        const list = Array.from(servers.entries()).map(([name, server]) => ({
          name,
          status: server.status,
          toolCount: server.tools.length,
          tools: server.tools.map((t) => t.originalName),
          lastError: server.lastError || null,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(list, null, 2),
            },
          ],
        };
      }
    );

    // Bağlı tüm tool'ları listele
    this.server.tool(
      "gateway__list_tools",
      "Gateway üzerinden erişilebilir tüm tool'ları listeler",
      {},
      async () => {
        const tools = Array.from(this.registeredTools.entries()).map(
          ([name, info]) => ({
            name,
            server: info.serverName,
            description: info.description,
          })
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(tools, null, 2),
            },
          ],
        };
      }
    );

    // Sunucuya yeniden bağlan
    this.server.tool(
      "gateway__reconnect",
      "Belirtilen MCP sunucusuna yeniden bağlanır",
      {
        serverName: z.string().describe("Yeniden bağlanılacak sunucu adı"),
      },
      async ({ serverName }) => {
        try {
          await this.connectionManager.reconnect(serverName);
          return {
            content: [
              {
                type: "text" as const,
                text: `${serverName} sunucusuna yeniden bağlanıldı.`,
              },
            ],
          };
        } catch (err: any) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Yeniden bağlanma hatası: ${err.message}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }
}

/**
 * Basit JSON Schema → Zod dönüştürücü
 * (Temel tipler için yeterli, karmaşık şemalar için genişletilebilir)
 */
function jsonSchemaToZod(schema: any): any {
  if (!schema) return z.any();

  switch (schema.type) {
    case "string":
      let str = z.string();
      if (schema.description) str = str.describe(schema.description);
      return str;
    case "number":
    case "integer":
      let num = z.number();
      if (schema.description) num = num.describe(schema.description);
      return num;
    case "boolean":
      let bool = z.boolean();
      if (schema.description) bool = bool.describe(schema.description);
      return bool;
    case "array":
      return z.array(jsonSchemaToZod(schema.items || {}));
    case "object":
      if (schema.properties) {
        const shape: any = {};
        for (const [key, val] of Object.entries(schema.properties)) {
          shape[key] = jsonSchemaToZod(val);
        }
        return z.object(shape);
      }
      return z.record(z.any());
    default:
      return z.any();
  }
}
```

### src/index.ts

```typescript
#!/usr/bin/env node

import { MCPGateway } from "./gateway.js";
import { log } from "./config.js";

async function main() {
  try {
    const configPath = process.argv.find((a) => a.startsWith("--config="))?.split("=")[1];
    const gateway = new MCPGateway(configPath);
    await gateway.start();
  } catch (err: any) {
    log("error", `Gateway başlatılamadı: ${err.message}`);
    process.exit(1);
  }
}

// Temiz çıkış
process.on("SIGINT", () => {
  log("info", "Gateway kapatılıyor...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("info", "Gateway kapatılıyor...");
  process.exit(0);
});

main();
```

---

## 5. Konfigürasyon Sistemi

### gateway.config.json

Gateway'in hangi MCP sunucularına bağlanacağını bu dosyadan okur. Proje kök dizinine yerleştir.

```json
{
  "name": "my-mcp-gateway",
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
    },
    {
      "name": "math",
      "transport": "stdio",
      "command": "node",
      "args": ["./examples/math-server/build/index.js"],
      "enabled": true
    },
    {
      "name": "remote-api",
      "transport": "http",
      "url": "http://localhost:3001/mcp",
      "enabled": false
    }
  ]
}
```

### Konfigürasyon Alanları Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `name` | string | ✅ | Sunucu adı, tool prefix'i olur |
| `transport` | `"stdio"` \| `"http"` | ✅ | Bağlantı türü |
| `command` | string | stdio için ✅ | Çalıştırılacak komut |
| `args` | string[] | ❌ | Komut argümanları |
| `url` | string | http için ✅ | Sunucu URL'i |
| `env` | object | ❌ | Ek ortam değişkenleri |
| `enabled` | boolean | ❌ | `false` ise atlanır (varsayılan: `true`) |
| `autoReconnect` | boolean | ❌ | Kopunca yeniden bağlan (varsayılan: `true`) |
| `timeout` | number | ❌ | Bağlantı zaman aşımı (ms) |

---

## 6. Alt MCP Sunucularına Bağlantı

### stdio Bağlantı (Lokal MCP'ler)

stdio transport, alt MCP'yi child process olarak başlatır. Claude Desktop ve Claude Code'un çoğu MCP sunucusu bu şekilde çalışır.

```json
{
  "name": "filesystem",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-server-filesystem", "/home/user/projects"]
}
```

### HTTP Bağlantı (Remote MCP'ler)

Streamable HTTP ile uzaktaki MCP sunucularına bağlanır.

```json
{
  "name": "remote-tools",
  "transport": "http",
  "url": "https://my-mcp-server.example.com/mcp"
}
```

### Mevcut Popüler MCP Sunucularını Ekleme

```json
{
  "servers": [
    {
      "name": "github",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxx"
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
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./mydb.sqlite"]
    }
  ]
}
```

---

## 7. Tool Proxy Mekanizması

### Namespace Sistemi

Farklı MCP sunucularında aynı isimli tool'lar olabilir. Gateway, her tool'un başına sunucu adını ekler:

```
github__create_issue        ← github sunucusundan
filesystem__read_file       ← filesystem sunucusundan
sqlite__query               ← sqlite sunucusundan
gateway__list_servers       ← gateway'in kendi meta tool'u
```

Separator olarak `__` (çift alt çizgi) kullanılır. Bu, MCP tool isimlendirme kurallarıyla uyumludur.

### Tool Çağrı Akışı

```
1. Claude Code → "github__create_issue" tool'unu çağır
2. Gateway → prefix'ten sunucu adını çıkar: "github"
3. Gateway → ConnectionManager'dan github client'ını al
4. Gateway → client.callTool("create_issue", args) çağır
5. GitHub MCP → İşlemi yap, sonucu döndür
6. Gateway → Sonucu Claude Code'a ilet
```

---

## 8. Hata Yönetimi ve Reconnect

### Bağlantı Hataları

Bir alt MCP bağlanamazsa, diğerleri etkilenmez. Gateway başlangıcında hatalı sunucuları loglar ve devam eder.

### Runtime Hataları

Tool çağrısı sırasında hata olursa, Claude Code'a anlamlı bir hata mesajı döner:

```json
{
  "content": [{ "type": "text", "text": "Hata: [github/create_issue] Connection refused" }],
  "isError": true
}
```

### Otomatik Reconnect

`autoReconnect: true` olan sunucular için tool çağrısı başarısız olduğunda yeniden bağlanma denenir.

---

## 9. Test İçin Örnek MCP Sunucuları

### examples/echo-server/index.ts

Basit bir echo sunucusu. Gateway'i test etmek için ideal.

```typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "echo-server",
  version: "1.0.0",
});

server.tool(
  "echo",
  "Gelen mesajı geri döndürür",
  { message: z.string().describe("Yankılanacak mesaj") },
  async ({ message }) => ({
    content: [{ type: "text", text: `Echo: ${message}` }],
  })
);

server.tool(
  "ping",
  "Sunucunun ayakta olduğunu doğrular",
  {},
  async () => ({
    content: [{ type: "text", text: `Pong! Zaman: ${new Date().toISOString()}` }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### examples/math-server/index.ts

Basit matematik işlemleri sunan bir MCP sunucusu.

```typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "math-server",
  version: "1.0.0",
});

server.tool(
  "add",
  "İki sayıyı toplar",
  {
    a: z.number().describe("Birinci sayı"),
    b: z.number().describe("İkinci sayı"),
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: `${a} + ${b} = ${a + b}` }],
  })
);

server.tool(
  "multiply",
  "İki sayıyı çarpar",
  {
    a: z.number().describe("Birinci sayı"),
    b: z.number().describe("İkinci sayı"),
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: `${a} × ${b} = ${a * b}` }],
  })
);

server.tool(
  "factorial",
  "Bir sayının faktöriyelini hesaplar",
  { n: z.number().int().min(0).max(170).describe("Sayı (0-170 arası)") },
  async ({ n }) => {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return {
      content: [{ type: "text", text: `${n}! = ${result}` }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Örnekleri Derleme

Örnekler için ayrı tsconfig oluştur veya doğrudan `tsx` ile çalıştır:

```bash
# Tek seferlik derleme
npx tsc --project tsconfig.json

# Veya örnek sunucuları tsx ile çalıştır (geliştirme sırasında)
npx tsx examples/echo-server/index.ts
```

---

## 10. GitHub'a Yayınlama

### .gitignore

```gitignore
node_modules/
build/
*.tsbuildinfo
.env
.env.local
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### README.md (GitHub için)

Projenin kök dizinine anlaşılır bir README koy. Şunları içermeli:

- Projenin ne yaptığı (kısa açıklama)
- Kurulum adımları
- Konfigürasyon örneği
- Claude Code ile nasıl kullanılacağı
- Örnek tool çağrıları

### LICENSE

MIT lisansı önerilir. GitHub'da repo oluştururken seçebilirsin.

### GitHub'a Push

```bash
# Git başlat
git init
git add .
git commit -m "feat: initial MCP Gateway implementation"

# GitHub'da repo oluştur (gh CLI ile veya web arayüzünden)
gh repo create mcp-gateway --public --description "MCP Gateway - Route multiple MCP servers through a single endpoint"

# Push et
git branch -M main
git remote add origin git@github.com:KULLANICI_ADIN/mcp-gateway.git
git push -u origin main
```

### GitHub Actions ile CI (Opsiyonel)

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run build
```

---

## 11. Claude Code ile Bağlantı ve Test

### Yöntem 1: Projeye Özel `.mcp.json`

Çalıştığın projenin kök dizinine `.mcp.json` dosyası oluştur:

```json
{
  "mcpServers": {
    "my-gateway": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp-gateway/build/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxx"
      }
    }
  }
}
```

### Yöntem 2: Global Claude Code Ayarları

`~/.claude/settings.json` dosyasına ekle:

```json
{
  "mcpServers": {
    "my-gateway": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp-gateway/build/index.js", "--config=/path/to/gateway.config.json"]
    }
  }
}
```

### Yöntem 3: GitHub'dan Doğrudan npx ile

Projeyi npm'e publish ettiysen:

```json
{
  "mcpServers": {
    "my-gateway": {
      "command": "npx",
      "args": ["-y", "mcp-gateway", "--config=./gateway.config.json"]
    }
  }
}
```

### Bağlantıyı Test Etme

Claude Code'u başlat ve şunları dene:

```
# Gateway'in meta tool'larını kullan
> Gateway'de hangi sunucular bağlı? (gateway__list_servers tool'unu çağırır)

> Mevcut tool'ları listele (gateway__list_tools tool'unu çağırır)

# Echo sunucusunu test et
> "Merhaba Dünya" mesajını echo et (echo__echo tool'unu çağırır)

# Math sunucusunu test et
> 42 ile 58'i topla (math__add tool'unu çağırır)

> 10'un faktöriyelini hesapla (math__factorial tool'unu çağırır)
```

### Claude Code'da MCP Durumunu Kontrol Etme

```bash
# Claude Code içinde
/mcp

# Bu komut bağlı MCP sunucularını ve tool'larını gösterir
```

---

## 12. npx ile Global Kullanım

### npm'e Publish Etme

```bash
# package.json'da name'in unique olduğundan emin ol
# Örn: @senin-kullanici-adin/mcp-gateway

# npm'e giriş yap
npm login

# Publish et
npm publish --access public
```

### Publish Sonrası Kullanım

Artık herkes şu şekilde kullanabilir:

```json
{
  "mcpServers": {
    "gateway": {
      "command": "npx",
      "args": ["-y", "@senin-kullanici-adin/mcp-gateway"]
    }
  }
}
```

---

## 13. İleri Seviye Özellikler

### Tool Filtreleme

Belirli sunuculardan sadece belirli tool'ları açmak isteyebilirsin:

```json
{
  "name": "github",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "allowedTools": ["create_issue", "list_repos"],
  "blockedTools": ["delete_repo"]
}
```

### Caching

Sık çağrılan tool sonuçlarını cache'leyerek performansı artırabilirsin:

```typescript
// Basit in-memory cache
const cache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 dakika

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.result;
  }
  cache.delete(key);
  return null;
}
```

### Resource ve Prompt Proxy

Şu anki implementasyon sadece tool'ları proxy'liyor. MCP'nin diğer kapasitelerini de ekleyebilirsin:

- **Resources**: `client.listResources()` → `server.resource()` ile kaydet
- **Prompts**: `client.listPrompts()` → `server.prompt()` ile kaydet

### Logging ve Monitoring

Detaylı log'lar için her tool çağrısını kaydet:

```typescript
// Her tool çağrısını logla
const callLog = {
  timestamp: new Date().toISOString(),
  server: serverName,
  tool: toolName,
  args: args,
  duration: endTime - startTime,
  success: !error,
};
```

---

## 14. Sorun Giderme

### Sık Karşılaşılan Sorunlar

**"MCP server disconnected" hatası:**
- `node build/index.js` komutunu doğrudan terminal'den çalıştırıp hata var mı kontrol et
- `gateway.config.json` dosyasında yolların doğru olduğundan emin ol
- Alt MCP sunucularının yüklü olduğunu kontrol et

**Tool'lar görünmüyor:**
- `gateway__list_servers` ile sunucu durumunu kontrol et
- Alt MCP'nin tool'ları düzgün expose ettiğini doğrulamak için tek başına test et
- Claude Code'da `/mcp` komutu ile bağlantı durumunu kontrol et

**"Cannot find module" hatası:**
- `npm run build` ile projeyi derlediğinden emin ol
- `package.json`'da `"type": "module"` olduğunu doğrula

**stdio üzerinde garip çıktılar:**
- Log'ları `stderr`'e yaz, asla `stdout`'a yazma (stdout MCP iletişimi için ayrılmış)
- `console.log` kullanma, yerine `process.stderr.write` kullan

**Bağlantı timeout:**
- `timeout` değerini artır
- Ağ bağlantısını kontrol et (HTTP transport için)
- Alt MCP'nin gerçekten çalıştığını doğrula

### Debug Modu

```bash
# Detaylı log'lar için
node build/index.js --config=./gateway.config.json 2>gateway.log

# Log dosyasını izle
tail -f gateway.log
```

### Bağımsız Test

Gateway'i Claude Code olmadan test etmek için MCP Inspector kullanabilirsin:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

Bu, tarayıcıda bir UI açar ve tüm tool'ları görmeni, test etmeni sağlar.

---

## Hızlı Başlangıç Özeti

```bash
# 1. Projeyi klonla veya oluştur
git clone https://github.com/KULLANICI/mcp-gateway.git
cd mcp-gateway

# 2. Bağımlılıkları yükle
npm install

# 3. Derle
npm run build

# 4. Config dosyasını düzenle
nano gateway.config.json

# 5. Claude Code config'ine ekle (.mcp.json)
echo '{
  "mcpServers": {
    "gateway": {
      "command": "node",
      "args": ["'$(pwd)'/build/index.js"]
    }
  }
}' > /path/to/your/project/.mcp.json

# 6. Claude Code'u başlat ve test et
claude
```

---

> **Not:** Bu proje aktif geliştirme aşamasındadır. Katkılarınız, önerileriniz ve yıldızlarınız memnuniyetle karşılanır! ⭐
