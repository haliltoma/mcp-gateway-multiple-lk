import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { GatewayConfig, LogLevel } from "./types.js";

const DEFAULT_CONFIG: GatewayConfig = {
  name: "mcp-gateway",
  version: "1.0.0",
  servers: [],
  useNamespace: true,
  logLevel: "info",
};

let currentLogLevel: LogLevel = "info";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Konfigürasyon dosyasını yükle
 */
export function loadConfig(configPath?: string): GatewayConfig {
  // 1. Komut satırı argümanından config path
  const pathArg =
    configPath ||
    process.argv.find((a) => a.startsWith("--config="))?.split("=")[1];

  // 2. Varsayılan konumları dene
  const candidates = [
    pathArg,
    resolve(process.cwd(), "gateway.config.json"),
    resolve(process.cwd(), ".mcp-gateway.json"),
    resolve(homedir(), ".mcp-gateway.json"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      try {
        const raw = readFileSync(candidate, "utf-8");
        const parsed = JSON.parse(raw) as Partial<GatewayConfig>;
        const config = { ...DEFAULT_CONFIG, ...parsed };

        // Log seviyesini ayarla
        if (config.logLevel) {
          currentLogLevel = config.logLevel;
        }

        log("info", `Config yüklendi: ${candidate}`);
        return config;
      } catch (err) {
        log("error", `Config parse hatası (${candidate}): ${err}`);
      }
    }
  }

  log("warn", "Config dosyası bulunamadı, varsayılan ayarlar kullanılıyor.");
  return DEFAULT_CONFIG;
}

/**
 * Log mesajı yaz (stderr'e)
 * MCP stdio protokolü stdout kullandığı için loglar stderr'e yazılmalı
 */
export function log(level: LogLevel, message: string): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLogLevel]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = getLogPrefix(level);
  process.stderr.write(`${prefix} [${timestamp}] ${message}\n`);
}

function getLogPrefix(level: LogLevel): string {
  switch (level) {
    case "debug":
      return "[DEBUG]";
    case "info":
      return "[INFO] ";
    case "warn":
      return "[WARN] ";
    case "error":
      return "[ERROR]";
  }
}

/**
 * Log seviyesini değiştir
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}
