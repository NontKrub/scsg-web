import { defineTool } from "@lovable.dev/mcp-js";
import { loadContent } from "@/lib/content.server";
import { ORG_MEMBER_TYPES, ORGS } from "@/data/sgsc";
import { membersOf } from "@/lib/derive";

export default defineTool({
  name: "get_organization",
  title: "Get congress structure",
  description:
    "Overview of the SGSC structure: the 4 organizations, the 5-person Congress Board, the Advisory Board, and member counts.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const c = await loadContent();
    const sg = membersOf(c, "SG").length;
    const organizations = ORGS.map((org) => ({
      ...org,
      count: membersOf(c, ORG_MEMBER_TYPES[org.slug]).length,
    }));
    const summary = {
      totalMembers: c.members.length,
      studentGovernmentMembers: sg,
      organizations,
      congressBoard: c.congressBoard,
      advisoryBoard: c.advisoryBoard,
    };
    return {
      content: [
        {
          type: "text" as const,
          text:
            `Student Congress (สภานักเรียน) — ${c.members.length} members across ${organizations.length} organizations.\n` +
            `Student Government (สโมสรนักเรียน): ${sg} members.\n` +
            `Congress Board: ${c.congressBoard.map((b) => `${b.role} — ${b.name || "(ยังไม่ระบุ)"}`).join("; ")}\n` +
            `Advisory Board: ${c.advisoryBoard.map((a) => `${a.role} — ${a.name || "(ยังไม่ระบุ)"}`).join("; ")}`,
        },
      ],
      structuredContent: summary,
    };
  },
});
