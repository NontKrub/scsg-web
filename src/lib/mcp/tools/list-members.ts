import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { MEMBERS, TOTAL_MEMBERS } from "@/data/sgsc";

export default defineTool({
  name: "list_members",
  title: "List congress members",
  description:
    "List the 68 members of the Student Congress (สภานักเรียน). Optionally filter by organization branch or search by name, role, or class.",
  inputSchema: {
    org: z
      .enum(["SG", "HOUSE", "CLUB", "CLASS"])
      .optional()
      .describe("Branch: SG = สโมสรนักเรียน (18), HOUSE = ประธานบ้านสายกีฬา (9), CLUB = ผู้แทนชุมนุม (18), CLASS = ผู้แทนห้องเรียน (23)"),
    search: z.string().trim().min(1).optional().describe("Free-text match on name, role, or classroom."),
    limit: z.number().int().min(1).max(68).optional().describe("Maximum number of members to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ org, search, limit }) => {
    const q = search?.toLowerCase();
    const rows = MEMBERS.filter(
      (m) =>
        (!org || m.org === org) &&
        (!q ||
          `${m.name} ${m.role} ${m.klass} ${m.orgLabel}`.toLowerCase().includes(q)),
    ).slice(0, limit ?? 68);

    return {
      content: [
        {
          type: "text" as const,
          text:
            `${rows.length} of ${TOTAL_MEMBERS} members\n` +
            rows.map((m) => `${m.name} — ${m.role} (${m.orgLabel}, ${m.klass})`).join("\n"),
        },
      ],
      structuredContent: { total: TOTAL_MEMBERS, count: rows.length, members: rows },
    };
  },
});
