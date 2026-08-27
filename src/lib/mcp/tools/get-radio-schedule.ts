import { defineTool } from "@lovable.dev/mcp-js";
import { loadRadioPage } from "@/lib/content.server";

export default defineTool({
  name: "get_radio_schedule",
  title: "Get SG Radio schedule",
  description:
    "Date-based SG Radio broadcast schedule (managed by Student Government / สโมสรนักเรียน) with slot availability and booking rules.",

  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { slots, rules } = await loadRadioPage();
    const dates = [...new Set(slots.map((slot) => slot.date))];
    const schedule = dates.map((date) => ({
      date,
      slots: slots
        .filter((slot) => slot.date === date)
        .map((slot) => ({ id: slot.id, time: slot.startTime, state: slot.state })),
    }));
    return {
      content: [
        {
          type: "text" as const,
          text:
            schedule
              .map((d) => `${d.date}: ${d.slots.map((s) => `${s.time} ${s.state}`).join(" · ")}`)
              .join("\n") + `\n\nกติกา:\n${rules.map((r) => `- ${r}`).join("\n")}`,
        },
      ],
      structuredContent: { schedule, rules },
    };
  },
});
