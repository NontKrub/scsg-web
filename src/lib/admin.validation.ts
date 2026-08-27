import { z } from "zod";
import { MONTHS } from "@/data/sgsc";

const id = z.string().uuid().optional();
const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number) => text(max).min(1);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = requiredText(100).regex(slugPattern);
const optionalSlug = text(100).refine((value) => !value || slugPattern.test(value));
const sort = z.number().int().min(0).max(10_000);
const imagePath = text(500).refine((value) => {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("..")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
});
const org = z.enum(["SG", "HOUSE", "CLUB", "CLASS"]);
const month = z.enum(MONTHS);
const newsCategory = z.enum(["SGSC", "STUDENT GOVERNMENT", "HOUSE", "CLUB"]);
const complaintCategory = z.enum([
  "FACILITY",
  "ACADEMIC",
  "ACTIVITY",
  "WELFARE",
  "SAFETY",
  "SUGGESTION",
  "OTHER",
]);
const complaintStatus = z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"]);

const adminRowSchemas = {
  members: z
    .object({
      id,
      name: text(120),
      role: text(160),
      org,
      org_label: text(120),
      klass: text(40),
      duties: text(2_000),
      photo_url: imagePath,
      sort,
    })
    .strip(),
  congress_board: z
    .object({
      id,
      role: text(160),
      person_name: text(120),
      from_org: text(40),
      klass: text(40),
      photo_url: imagePath,
      sort,
    })
    .strip(),
  advisory_board: z
    .object({
      id,
      role: text(160),
      person_name: text(120),
      description: text(2_000),
      photo_url: imagePath,
      sort,
    })
    .strip(),
  houses: z
    .object({
      id,
      no: text(10),
      name: text(100),
      name_th: text(100),
      color_label: text(80),
      personality: text(500),
      intro: text(2_000),
      captain: text(120),
      captain_role: text(160),
      sort,
    })
    .strip(),
  house_scores: z
    .object({
      id,
      house_slug: slug,
      month,
      score: z.number().min(0).max(100),
    })
    .strip(),
  honors: z
    .object({
      id,
      month,
      house_of_month: optionalSlug,
      character_house: optionalSlug,
    })
    .strip(),
  clubs: z
    .object({
      id,
      slug,
      name: text(100),
      name_th: text(100),
      tagline: text(500),
      about: text(2_000),
      cls: text(120),
      head: text(120),
      member_count: z.number().int().min(0).max(100_000),
      activities: z.array(text(300)).max(100),
      sort,
    })
    .strip(),
  news: z
    .object({
      id,
      slug,
      title: requiredText(200),
      cat: newsCategory,
      date_label: text(80),
      intro: text(2_000),
      body: z.array(text(4_000)).max(100),
      related: text(160),
      house_slug: optionalSlug,
      cover_url: imagePath,
      published: z.boolean(),
    })
    .strip(),
  complaints: z
    .object({
      id,
      subject: requiredText(160),
      cat: complaintCategory,
      detail: requiredText(2_000),
      reporter: text(120),
      klass: text(40),
      contact: text(160),
      anonymous: z.boolean(),
      status: complaintStatus,
      admin_note: text(2_000),
    })
    .strip(),
  site_settings: z
    .object({
      key: requiredText(100).regex(/^[a-z][a-z0-9_]*$/),
      value: text(1_000),
    })
    .strip(),
} as const;

const scoreBatchSchema = z
  .object({
    month,
    scores: z
      .array(
        z
          .object({
            house_slug: slug,
            score: z.number().min(0).max(100),
          })
          .strip(),
      )
      .max(100),
  })
  .strip();

export function validateAdminRow(table: string, row: unknown): Record<string, unknown> {
  const schema = adminRowSchemas[table as keyof typeof adminRowSchemas];
  if (!schema) throw new Error("ตารางนี้ไม่อนุญาตให้แก้ไข");
  const result = schema.safeParse(row);
  if (!result.success) throw new Error("ข้อมูลที่ส่งมาไม่ถูกต้อง");
  return result.data;
}

export function validateScoreBatch(input: unknown) {
  const result = scoreBatchSchema.safeParse(input);
  if (!result.success) throw new Error("ข้อมูลคะแนนไม่ถูกต้อง");
  const houses = new Set<string>();
  for (const score of result.data.scores) {
    if (houses.has(score.house_slug)) throw new Error("มีบ้านซ้ำในข้อมูลคะแนน");
    houses.add(score.house_slug);
  }
  return result.data;
}
