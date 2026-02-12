#!/usr/bin/env node

/**
 * Echo Server - Gateway test için basit bir MCP sunucusu
 * İki tool sunar: echo ve ping
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "echo-server",
  version: "1.0.0",
});

// Echo tool - gelen mesajı geri döndürür
server.tool(
  "echo",
  "Gelen mesajı geri döndürür",
  {
    message: z.string().describe("Yankılanacak mesaj"),
  },
  async ({ message }) => ({
    content: [
      {
        type: "text" as const,
        text: `Echo: ${message}`,
      },
    ],
  })
);

// Ping tool - sunucunun ayakta olduğunu doğrular
server.tool(
  "ping",
  "Sunucunun ayakta olduğunu doğrular",
  {},
  async () => ({
    content: [
      {
        type: "text" as const,
        text: `Pong! Zaman: ${new Date().toISOString()}`,
      },
    ],
  })
);

// Reverse tool - metni tersine çevirir
server.tool(
  "reverse",
  "Gelen metni tersine çevirir",
  {
    text: z.string().describe("Tersine çevrilecek metin"),
  },
  async ({ text }) => ({
    content: [
      {
        type: "text" as const,
        text: text.split("").reverse().join(""),
      },
    ],
  })
);

// Uppercase tool - metni büyük harfe çevirir
server.tool(
  "uppercase",
  "Gelen metni büyük harfe çevirir",
  {
    text: z.string().describe("Büyük harfe çevrilecek metin"),
  },
  async ({ text }) => ({
    content: [
      {
        type: "text" as const,
        text: text.toUpperCase(),
      },
    ],
  })
);

// Sunucuyu başlat
const transport = new StdioServerTransport();
await server.connect(transport);
