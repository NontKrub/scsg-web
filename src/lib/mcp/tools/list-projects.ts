import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PROJECTS } from "@/data/sgsc";

export default defineTool({
  name: "list_projects",
  title: "List SGSC projects",
  description: "List SGSC projects with owner organization, status, timeline, and latest updates.",
  inputSchema: {
    status: z.enum(["ACTIVE", "UPCOMING", "COMPLETED"]).optional().describe("Filter by project status."),
    org: z.string().trim().min(1).optional().describe("Filter by owning organization, e.g. สโมสรนักเรียน."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ status, org }) => {
    const rows = PROJECTS.filter((p) => (!status || p.status === status) && (!org || p.org.includes(org)));
    return {
      content: [
        {
          type: "text" as const,
          text: rows.map((p) => `${p.name} [${p.status}] — ${p.org} · ${p.start}–${p.end}\n${p.desc}`).join("\n\n"),
        },
      ],
      structuredContent: { count: rows.length, projects: rows },
    };
  },
});
