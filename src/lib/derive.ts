import { MONTHS, type Month, type SiteContent } from "@/data/sgsc";

export function ranking(c: SiteContent, month: Month) {
  return [...c.houses]
    .sort((a, b) => b.scores[month] - a.scores[month])
    .map((h, i) => ({ house: h, rank: i + 1, score: h.scores[month] }));
}

export function rankOf(c: SiteContent, slug: string, month: Month) {
  return ranking(c, month).findIndex((r) => r.house.slug === slug) + 1;
}

export function growth(c: SiteContent, slug: string, month: Month) {
  const h = c.houses.find((x) => x.slug === slug);
  if (!h) return 0;
  const i = MONTHS.indexOf(month);
  if (i <= 0) return 0;
  return +(h.scores[month] - h.scores[MONTHS[i - 1]!]).toFixed(1);
}

export function honorsOf(c: SiteContent, month: Month) {
  return c.honors[month] ?? { houseOfMonth: "", character: "" };
}

export function membersOf(c: SiteContent, org: "SG" | "HOUSE" | "CLUB" | "CLASS") {
  return c.members.filter((m) => m.org === org);
}

export const display = (v: string, fallback = "—") => (v && v.trim() ? v : fallback);
