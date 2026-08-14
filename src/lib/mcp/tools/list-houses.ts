import { defineTool } from "@lovable.dev/mcp-js";
import { HOUSES } from "@/data/sgsc";

export default defineTool({
  name: "list_houses",
  title: "List sports houses",
  description: "List the 9 sports houses (บ้านสายกีฬา) with colour, personality, president, and intro.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const houses = HOUSES.map((h) => ({
      slug: h.slug,
      no: h.no,
      name: h.name,
      nameTh: h.nameTh,
      colorLabel: h.colorLabel,
      personality: h.personality,
      captain: h.captain,
      intro: h.intro,
    }));
    return {
      content: [
        {
          type: "text" as const,
          text: houses.map((h) => `${h.no} ${h.name} (${h.nameTh}) — ${h.colorLabel} · ประธาน ${h.captain}`).join("\n"),
        },
      ],
      structuredContent: { count: houses.length, houses },
    };
  },
});
