import { defineTool } from "@lovable.dev/mcp-js";
import { loadContent } from "@/lib/content.server";

export default defineTool({
  name: "list_clubs",
  title: "List interest clubs",
  description:
    "List the 6 interest clubs (ชุมนุม) of SGSC with their tagline, member count, and activities.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const c = await loadContent();
    const clubs = c.clubs.map((c) => ({
      slug: c.slug,
      name: c.name,
      nameTh: c.nameTh,
      tagline: c.tagline,
      members: c.members,
      activities: c.activities,
    }));
    return {
      content: [
        {
          type: "text" as const,
          text: clubs
            .map((c) => `${c.name} (${c.nameTh}) — ${c.tagline} · ${c.members} คน`)
            .join("\n"),
        },
      ],
      structuredContent: { count: clubs.length, clubs },
    };
  },
});
