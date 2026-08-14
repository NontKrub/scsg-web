import { defineTool } from "@lovable.dev/mcp-js";
import { RADIO_DAYS, RADIO_RULES, RADIO_SCHEDULE, RADIO_SLOTS } from "@/data/sgsc";

export default defineTool({
  name: "get_radio_schedule",
  title: "Get SG Radio schedule",
  description:
    "Weekly SG Radio broadcast schedule (a Student Government / สโมสรนักเรียน project) with slot availability and booking rules.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const schedule = RADIO_DAYS.map((day) => ({
      day,
      slots: RADIO_SLOTS.map((time, i) => ({ time, state: RADIO_SCHEDULE[day]?.[i] ?? "CLOSED" })),
    }));
    return {
      content: [
        {
          type: "text" as const,
          text:
            schedule
              .map((d) => `${d.day}: ${d.slots.map((s) => `${s.time} ${s.state}`).join(" · ")}`)
              .join("\n") +
            `\n\nกติกา:\n${RADIO_RULES.map((r) => `- ${r}`).join("\n")}`,
        },
      ],
      structuredContent: { schedule, rules: RADIO_RULES },
    };
  },
});
