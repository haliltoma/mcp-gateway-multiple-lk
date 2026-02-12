import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ConnectionManager } from "./connection-manager.js";
import { loadConfig, log } from "./config.js";
import type { GatewayConfig, ToolInfo } from "./types.js";

/**
 * MCP Gateway - Birden fazla MCP sunucusunu tek noktadan yönetir
 */
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
    const toolName =
      this.config.useNamespace !== false ? tool.gatewayName : tool.originalName;

    // JSON Schema'dan Zod şemasına dönüştür
    const zodSchema = this.jsonSchemaToZod(tool.inputSchema);

    this.server.tool(
      toolName,
      `[${tool.serverName}] ${tool.description}`,
      zodSchema,
      async (params: Record<string, unknown>) => {
        try {
          const result = await this.connectionManager.callTool(
            tool.serverName,
            tool.originalName,
            params
          );

          // MCP SDK result formatı
          return result as {
            content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }>;
            isError?: boolean;
          };
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          return {
            content: [
              {
                type: "text" as const,
                text: `Hata: [${tool.serverName}/${tool.originalName}] ${errorMessage}`,
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
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          return {
            content: [
              {
                type: "text" as const,
                text: `Yeniden bağlanma hatası: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Gateway durumunu getir
    this.server.tool(
      "gateway__status",
      "Gateway'in genel durumunu gösterir",
      {},
      async () => {
        const servers = this.connectionManager.getAll();
        const connectedCount = Array.from(servers.values()).filter(
          (s) => s.status === "connected"
        ).length;

        const status = {
          name: this.config.name,
          version: this.config.version,
          totalServers: servers.size,
          connectedServers: connectedCount,
          totalTools: this.registeredTools.size,
          useNamespace: this.config.useNamespace,
        };

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }
    );
  }

  /**
   * JSON Schema'yı Zod şemasına dönüştür
   * Temel tipler için yeterli, karmaşık şemalar için genişletilebilir
   */
  private jsonSchemaToZod(
    schema: Record<string, unknown>
  ): Record<string, z.ZodTypeAny> {
    const properties = schema.properties as Record<string, unknown> | undefined;
    if (!properties) {
      return {};
    }

    const result: Record<string, z.ZodTypeAny> = {};

    for (const [key, propSchema] of Object.entries(properties)) {
      result[key] = this.convertProperty(propSchema as Record<string, unknown>);
    }

    return result;
  }

  private convertProperty(schema: Record<string, unknown>): z.ZodTypeAny {
    if (!schema) return z.any();

    const type = schema.type as string | undefined;
    const description = schema.description as string | undefined;

    let zodType: z.ZodTypeAny;

    switch (type) {
      case "string":
        zodType = z.string();
        break;
      case "number":
      case "integer":
        zodType = z.number();
        break;
      case "boolean":
        zodType = z.boolean();
        break;
      case "array": {
        const items = schema.items as Record<string, unknown> | undefined;
        zodType = z.array(items ? this.convertProperty(items) : z.any());
        break;
      }
      case "object": {
        const props = schema.properties as Record<string, unknown> | undefined;
        if (props) {
          const shape: Record<string, z.ZodTypeAny> = {};
          for (const [k, v] of Object.entries(props)) {
            shape[k] = this.convertProperty(v as Record<string, unknown>);
          }
          zodType = z.object(shape);
        } else {
          zodType = z.record(z.any());
        }
        break;
      }
      default:
        zodType = z.any();
    }

    if (description) {
      zodType = zodType.describe(description);
    }

    return zodType;
  }

  /**
   * Gateway'i durdur ve tüm bağlantıları kapat
   */
  async stop(): Promise<void> {
    log("info", "Gateway durduruluyor...");
    await this.connectionManager.disconnectAll();
    log("info", "Gateway durduruldu.");
  }
}
