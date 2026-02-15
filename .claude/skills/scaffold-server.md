---
description: Sıfırdan yeni bir custom MCP sunucusu iskeleti oluşturur. TypeScript, MCP SDK, tool tanımları ve gateway entegrasyonu dahil.
user_invocable: true
---

# Scaffold New MCP Server

Kullanıcı için sıfırdan yeni bir MCP sunucusu oluştur. Bu sunucu gateway üzerinden kullanılabilir olacak.

## Adımlar

1. **Bilgileri al** (AskUserQuestion):
   - Sunucu adı (örn: `weather-server`, `database-helper`)
   - Ne yapacağının kısa açıklaması
   - Hangi tool'ları sağlayacak (en az 1)
   - Ek bağımlılık gerekli mi?

2. **Proje yapısı oluştur**:
```
examples/<sunucu-adi>/
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

3. **package.json** oluştur:
   - `"type": "module"`
   - Bağımlılık: `@modelcontextprotocol/sdk`, `zod`
   - Build script: `tsc`
   - Start script: `node build/index.js`

4. **tsconfig.json** oluştur:
   - Ana projeden kopyala ama `rootDir`/`outDir` ayarla

5. **src/index.ts** oluştur - MCP sunucu iskeleti:
```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "<sunucu-adi>",
  version: "1.0.0",
});

// Tool tanımları buraya
server.tool(
  "tool_name",
  "Tool açıklaması",
  { param: z.string().describe("Parametre açıklaması") },
  async ({ param }) => {
    return {
      content: [{ type: "text", text: `Sonuç: ${param}` }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

6. **Gateway config'e ekle**: `gateway.config.json`'a yeni sunucuyu otomatik ekle

7. **Build script'leri güncelle**: `package.json`'daki `build:<name>` ve `build:examples` script'lerini güncelle

## Kurallar
- Her tool için Zod schema ile tip güvenli parametre tanımla
- Açıklamaları Türkçe yaz
- Loglama stderr'e yapılsın (stdout MCP protokolü için ayrılmış)
- Graceful shutdown handler'ları ekle (SIGINT, SIGTERM)
