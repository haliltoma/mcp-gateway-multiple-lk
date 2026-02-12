#!/usr/bin/env node

import { MCPGateway } from "./gateway.js";
import { log } from "./config.js";

let gateway: MCPGateway | null = null;

async function main(): Promise<void> {
  try {
    // Config path'i komut satırından al
    const configPath = process.argv
      .find((a) => a.startsWith("--config="))
      ?.split("=")[1];

    gateway = new MCPGateway(configPath);
    await gateway.start();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log("error", `Gateway başlatılamadı: ${errorMessage}`);
    process.exit(1);
  }
}

// Temiz çıkış için sinyal handler'ları
async function shutdown(signal: string): Promise<void> {
  log("info", `${signal} alındı, Gateway kapatılıyor...`);
  if (gateway) {
    await gateway.stop();
  }
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Beklenmeyen hatalar için
process.on("uncaughtException", (err) => {
  log("error", `Beklenmeyen hata: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log("error", `İşlenmemiş Promise reddi: ${reason}`);
  process.exit(1);
});

// Gateway'i başlat
main();
