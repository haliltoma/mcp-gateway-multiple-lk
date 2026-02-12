#!/usr/bin/env node

/**
 * Math Server - Gateway test için matematik işlemleri sunan MCP sunucusu
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "math-server",
  version: "1.0.0",
});

// Add tool - iki sayıyı toplar
server.tool(
  "add",
  "İki sayıyı toplar",
  {
    a: z.number().describe("Birinci sayı"),
    b: z.number().describe("İkinci sayı"),
  },
  async ({ a, b }) => ({
    content: [
      {
        type: "text" as const,
        text: `${a} + ${b} = ${a + b}`,
      },
    ],
  })
);

// Subtract tool - iki sayıyı çıkarır
server.tool(
  "subtract",
  "İki sayıyı çıkarır",
  {
    a: z.number().describe("Birinci sayı"),
    b: z.number().describe("İkinci sayı"),
  },
  async ({ a, b }) => ({
    content: [
      {
        type: "text" as const,
        text: `${a} - ${b} = ${a - b}`,
      },
    ],
  })
);

// Multiply tool - iki sayıyı çarpar
server.tool(
  "multiply",
  "İki sayıyı çarpar",
  {
    a: z.number().describe("Birinci sayı"),
    b: z.number().describe("İkinci sayı"),
  },
  async ({ a, b }) => ({
    content: [
      {
        type: "text" as const,
        text: `${a} × ${b} = ${a * b}`,
      },
    ],
  })
);

// Divide tool - iki sayıyı böler
server.tool(
  "divide",
  "İki sayıyı böler",
  {
    a: z.number().describe("Bölünen sayı"),
    b: z.number().describe("Bölen sayı"),
  },
  async ({ a, b }) => {
    if (b === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Hata: Sıfıra bölme yapılamaz!",
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: `${a} ÷ ${b} = ${a / b}`,
        },
      ],
    };
  }
);

// Factorial tool - faktöriyel hesaplar
server.tool(
  "factorial",
  "Bir sayının faktöriyelini hesaplar",
  {
    n: z
      .number()
      .int()
      .min(0)
      .max(170)
      .describe("Sayı (0-170 arası)"),
  },
  async ({ n }) => {
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return {
      content: [
        {
          type: "text" as const,
          text: `${n}! = ${result}`,
        },
      ],
    };
  }
);

// Power tool - üs hesaplar
server.tool(
  "power",
  "Bir sayının üssünü hesaplar",
  {
    base: z.number().describe("Taban"),
    exponent: z.number().describe("Üs"),
  },
  async ({ base, exponent }) => ({
    content: [
      {
        type: "text" as const,
        text: `${base}^${exponent} = ${Math.pow(base, exponent)}`,
      },
    ],
  })
);

// Sqrt tool - karekök hesaplar
server.tool(
  "sqrt",
  "Bir sayının karekökünü hesaplar",
  {
    n: z.number().min(0).describe("Sayı (0 veya pozitif)"),
  },
  async ({ n }) => ({
    content: [
      {
        type: "text" as const,
        text: `√${n} = ${Math.sqrt(n)}`,
      },
    ],
  })
);

// Sunucuyu başlat
const transport = new StdioServerTransport();
await server.connect(transport);
