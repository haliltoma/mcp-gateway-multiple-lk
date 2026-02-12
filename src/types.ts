import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

/** Bir alt MCP sunucusunun yapılandırması */
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

/** Gateway ana yapılandırması */
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

/** Bağlı bir MCP sunucusunun durumu */
export interface ConnectedServer {
  config: ServerConfig;
  client: Client | null;
  transport: Transport | null;
  tools: ToolInfo[];
  status: "connected" | "disconnected" | "connecting" | "error";
  lastError?: string;
}

/** Keşfedilen bir tool'un bilgisi */
export interface ToolInfo {
  /** Orijinal tool adı */
  originalName: string;

  /** Gateway üzerindeki adı (namespace dahil) */
  gatewayName: string;

  /** Tool açıklaması */
  description: string;

  /** Input şeması (JSON Schema) */
  inputSchema: Record<string, unknown>;

  /** Hangi sunucuya ait */
  serverName: string;
}

/** Log seviyeleri */
export type LogLevel = "debug" | "info" | "warn" | "error";
