import { defineTool } from "@lovable.dev/mcp-js";
import { loadContent } from "@/lib/content.server";
import { z } from "zod";

export default defineTool({
  name: "list_news",
  title: "List SGSC news",
  description: "List news and announcements published by SGSC, newest first, optionally filtered by category.",
  inputSchema: {
    category: z
      .enum(["SGSC", "STUDENT GOVERNMENT", "HOUSE", "CLUB"])
      .optional()
      .describe("Filter by news category."),

    limit: z.number().int().min(1).max(50).optional().describe("Maximum number of articles to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }) => {
    const c = await loadContent();
    const rows = c.news.filter((n) => !category || n.cat === category)
      .slice(0, limit ?? 10)
      .map((n) => ({ slug: n.slug, title: n.title, cat: n.cat, date: n.date, intro: n.intro }));
    return {
      content: [
        {
          type: "text" as const,
          text: rows.map((n) => `[${n.cat}] ${n.date} — ${n.title}\n${n.intro}`).join("\n\n"),
        },
      ],
      structuredContent: { count: rows.length, news: rows },
    };
  },
});
