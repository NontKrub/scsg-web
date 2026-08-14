import { defineTool } from "@lovable.dev/mcp-js";
import { loadContent } from "@/lib/content.server";
import { RADIO_DAYS, RADIO_SLOTS } from "@/data/sgsc";

export default defineTool({
  name: "get_radio_schedule",
  title: "Get SG Radio schedule",
  description:
    "Weekly SG Radio broadcast schedule (a Student Government / สโมสรนักเรียน project) with slot availability and booking rules.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const c = await loadContent();
    const schedule = RADIO_DAYS.map((day) => ({
      day,
      slots: RADIO_SLOTS.map((time, i) => ({ time, state: c.radioSchedule[day]?.[i] ?? "CLOSED" })),
    }));
    return {
      content: [
        {
          type: "text" as const,
          text:
            schedule
              .map((d) => `${d.day}: ${d.slots.map((s) => `${s.time} ${s.state}`).join(" · ")}`)
              .join("\n") +
            `\n\nกติกา:\n${c.radioRules.map((r) => `- ${r}`).join("\n")}`,
        },
      ],
      structuredContent: { schedule, rules: c.radioRules },
    };
  },
});
