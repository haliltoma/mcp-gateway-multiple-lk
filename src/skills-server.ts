#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";

interface SkillMeta {
  name: string;
  description: string;
  content: string;
  category: string;
}

const SKILLS_DIR = resolve(
  process.argv.find((a) => a.startsWith("--skills-dir="))?.split("=")[1] ||
    resolve(import.meta.dirname, "..", ".claude", "skills")
);

function loadSkills(): SkillMeta[] {
  if (!existsSync(SKILLS_DIR)) {
    process.stderr.write(`[skills-server] Skills directory not found: ${SKILLS_DIR}\n`);
    return [];
  }

  const files = readdirSync(SKILLS_DIR).filter((f) => f.endsWith(".md"));
  const skills: SkillMeta[] = [];

  for (const file of files) {
    const raw = readFileSync(resolve(SKILLS_DIR, file), "utf-8");
    const name = basename(file, ".md");

    // Parse frontmatter
    let description = "";
    let content = raw;
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (fmMatch) {
      const frontmatter = fmMatch[1];
      content = fmMatch[2].trim();
      const descMatch = frontmatter.match(/description:\s*(.+)/);
      if (descMatch) description = descMatch[1].trim();
    }

    // Categorize
    const frontendSkills = [
      "ui-component", "landing-page", "dashboard", "animation",
      "design-system", "form-builder", "accessibility-audit",
      "responsive-layout", "performance-audit", "seo-optimize", "dark-mode",
    ];
    const category = frontendSkills.includes(name) ? "frontend" : "gateway";

    skills.push({ name, description, content, category });
  }

  return skills;
}

async function main(): Promise<void> {
  const skills = loadSkills();
  process.stderr.write(`[skills-server] Loaded ${skills.length} skills from ${SKILLS_DIR}\n`);

  const server = new McpServer({
    name: "skills-server",
    version: "1.0.0",
  });

  // Tool: List all skills
  server.tool(
    "list_skills",
    "Tüm mevcut skill'leri listeler. Kategori bazında filtreleme destekler.",
    {
      category: z
        .enum(["all", "frontend", "gateway"])
        .optional()
        .describe("Kategori filtresi: all, frontend, gateway"),
    },
    async ({ category }) => {
      const filtered =
        !category || category === "all"
          ? skills
          : skills.filter((s) => s.category === category);

      const list = filtered.map((s) => ({
        name: s.name,
        description: s.description,
        category: s.category,
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

  // Tool: Get a specific skill's full content
  server.tool(
    "get_skill",
    "Belirtilen skill'in tam içeriğini getirir. Bu içerik, skill'in tüm talimatlarını, kod örneklerini ve best practice'leri içerir.",
    {
      name: z
        .string()
        .describe(
          "Skill adı (örn: landing-page, dashboard, ui-component, diagnose)"
        ),
    },
    async ({ name: skillName }) => {
      const skill = skills.find(
        (s) => s.name === skillName || s.name === skillName.replace(/^\//, "")
      );

      if (!skill) {
        const available = skills.map((s) => s.name).join(", ");
        return {
          content: [
            {
              type: "text" as const,
              text: `Skill bulunamadı: "${skillName}"\n\nMevcut skill'ler: ${available}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `# Skill: ${skill.name}\n**Kategori:** ${skill.category}\n**Açıklama:** ${skill.description}\n\n---\n\n${skill.content}`,
          },
        ],
      };
    }
  );

  // Tool: Search skills by keyword
  server.tool(
    "search_skills",
    "Skill'ler içinde anahtar kelime araması yapar. İçerik ve açıklamalarda arar.",
    {
      query: z.string().describe("Aranacak kelime veya ifade"),
    },
    async ({ query }) => {
      const q = query.toLowerCase();
      const results = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q)
      );

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `"${query}" için sonuç bulunamadı.`,
            },
          ],
        };
      }

      const list = results.map((s) => {
        // Find matching context
        const idx = s.content.toLowerCase().indexOf(q);
        const snippet =
          idx >= 0
            ? "..." +
              s.content.substring(Math.max(0, idx - 60), idx + q.length + 60) +
              "..."
            : "";

        return {
          name: s.name,
          description: s.description,
          category: s.category,
          match_snippet: snippet,
        };
      });

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

  // Tool: Get multiple skills at once
  server.tool(
    "get_skills_bundle",
    "Birden fazla skill'i tek seferde getirir. Birlikte kullanılacak skill'leri toplu almak için idealdir.",
    {
      names: z
        .array(z.string())
        .describe(
          "Skill adları listesi (örn: ['design-system', 'dark-mode', 'ui-component'])"
        ),
    },
    async ({ names }) => {
      const results: string[] = [];
      const notFound: string[] = [];

      for (const skillName of names) {
        const skill = skills.find(
          (s) =>
            s.name === skillName || s.name === skillName.replace(/^\//, "")
        );
        if (skill) {
          results.push(
            `\n${"=".repeat(60)}\n# ${skill.name} (${skill.category})\n${skill.description}\n${"=".repeat(60)}\n\n${skill.content}`
          );
        } else {
          notFound.push(skillName);
        }
      }

      let output = results.join("\n\n");
      if (notFound.length > 0) {
        output += `\n\n⚠️ Bulunamayan skill'ler: ${notFound.join(", ")}`;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: output,
          },
        ],
      };
    }
  );

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("[skills-server] Ready.\n");
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
process.on("unhandledRejection", (reason) => {
  process.stderr.write(`[skills-server] Unhandled rejection: ${reason}\n`);
});

main();
