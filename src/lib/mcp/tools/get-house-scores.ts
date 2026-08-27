import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { loadContent } from "@/lib/content.server";
import { MONTHS, tierOf } from "@/data/sgsc";
import { honorsOf, ranking } from "@/lib/derive";

export default defineTool({
  name: "get_house_scores",
  title: "Get House Competition scores",
  description:
    "Monthly House Competition standings: ranking, score, and tier for each of the 9 sports houses, plus the honors of that month.",
  inputSchema: {
    month: z
      .enum(MONTHS)
      .optional()
      .describe(`Month code (${MONTHS.join(", ")}). Defaults to the current month.`),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ month }) => {
    const c = await loadContent();
    const m = month ?? c.currentMonth;
    const rows = ranking(c, m).map((r) => ({
      rank: r.rank,
      slug: r.house.slug,
      name: r.house.name,
      nameTh: r.house.nameTh,
      score: r.score,
      tier: tierOf(r.score).name,
    }));
    const honors = honorsOf(c, m);
    const houseOfMonth =
      c.houses.find((h) => h.slug === honors.houseOfMonth)?.name ?? honors.houseOfMonth;

    return {
      content: [
        {
          type: "text" as const,
          text:
            `House Competition — ${m}\n` +
            rows
              .map((r) => `${r.rank}. ${r.name} (${r.nameTh}) — ${r.score} · ${r.tier}`)
              .join("\n") +
            `\nHouse of the Month: ${houseOfMonth || "—"}\nCharacter Excellence: ${honors.character || "—"}`,
        },
      ],
      structuredContent: {
        month: m,
        standings: rows,
        honors: { houseOfMonth, character: honors.character },
      },
    };
  },
});
