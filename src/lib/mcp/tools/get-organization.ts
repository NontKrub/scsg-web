import { defineTool } from "@lovable.dev/mcp-js";
import { ADVISORY_BOARD, CONGRESS_BOARD, ORGS, SG_TOTAL, TOTAL_MEMBERS } from "@/data/sgsc";

export default defineTool({
  name: "get_organization",
  title: "Get congress structure",
  description:
    "Overview of the SGSC structure: the 4 organizations, the 5-person Congress Board, the Advisory Board, and member counts.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const summary = {
      totalMembers: TOTAL_MEMBERS,
      studentGovernmentMembers: SG_TOTAL,
      organizations: ORGS,
      congressBoard: CONGRESS_BOARD,
      advisoryBoard: ADVISORY_BOARD,
    };
    return {
      content: [
        {
          type: "text" as const,
          text:
            `Student Congress (สภานักเรียน) — ${TOTAL_MEMBERS} members across ${ORGS.length} organizations.\n` +
            `Student Government (สโมสรนักเรียน): ${SG_TOTAL} members.\n` +
            `Congress Board: ${CONGRESS_BOARD.map((b) => `${b.role} — ${b.member.name}`).join("; ")}\n` +
            `Advisory Board: ${ADVISORY_BOARD.map((a) => `${a.role} — ${a.name}`).join("; ")}`,
        },
      ],
      structuredContent: summary,
    };
  },
});
