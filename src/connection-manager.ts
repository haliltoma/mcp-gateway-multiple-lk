import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { ServerConfig, ConnectedServer, ToolInfo } from "./types.js";
import { log } from "./config.js";

/**
 * Alt MCP sunucularına bağlantıları yöneten sınıf
 */
export class ConnectionManager {
  private servers: Map<string, ConnectedServer> = new Map();

  /**
   * Bir MCP sunucusuna bağlan ve tool'larını keşfet
   */
  async connect(config: ServerConfig): Promise<ConnectedServer> {
    // Devre dışı sunucuları atla
    if (config.enabled === false) {
      log("info", `[${config.name}] Devre dışı, atlanıyor.`);
      const disabled: ConnectedServer = {
        config,
        client: null,
        transport: null,
        tools: [],
        status: "disconnected",
      };
      this.servers.set(config.name, disabled);
      return disabled;
    }

    log("info", `[${config.name}] Bağlanılıyor...`);

    const client = new Client(
      { name: `gateway-client-${config.name}`, version: "1.0.0" },
      { capabilities: {} }
    );

    let transport: Transport;

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

        // SSE client transport kullan (HTTP+SSE)
        transport = new SSEClientTransport(new URL(config.url));
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log("error", `[${config.name}] Bağlantı hatası: ${errorMessage}`);

      const failed: ConnectedServer = {
        config,
        client: null,
        transport: null,
        tools: [],
        status: "error",
        lastError: errorMessage,
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

    return (result.tools || []).map((tool) => ({
      originalName: tool.name,
      gatewayName: `${serverName}__${tool.name}`, // namespace separator
      description: tool.description || "",
      inputSchema: (tool.inputSchema as Record<string, unknown>) || { type: "object", properties: {} },
      serverName,
    }));
  }

  /**
   * Belirli bir sunucudaki tool'u çağır
   */
  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    const server = this.servers.get(serverName);

    if (!server || server.status !== "connected" || !server.client) {
      throw new Error(`Sunucu bağlı değil: ${serverName}`);
    }

    try {
      const result = await server.client.callTool({
        name: toolName,
        arguments: args,
      });
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log("error", `[${serverName}] Tool çağrı hatası (${toolName}): ${errorMessage}`);

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
    } catch {
      // Kapatma hatasını yoksay
    }

    await this.connect(server.config);
  }

  /**
   * Belirli bir sunucuyu getir
   */
  get(serverName: string): ConnectedServer | undefined {
    return this.servers.get(serverName);
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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        log("error", `[${name}] Kapatma hatası: ${errorMessage}`);
      }
    }
    this.servers.clear();
  }
}
