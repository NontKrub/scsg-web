import { describe, expect, test } from "bun:test";
import { validateAdminRow, validateScoreBatch } from "@/lib/admin.validation";

const member = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "นักเรียน ทดสอบ",
  role: "กรรมการ",
  org: "SG",
  org_label: "สโมสรนักเรียน",
  klass: "ม.5/1",
  duties: "งานทดสอบ",
  photo_url: "/api/public/img/member.jpg",
  sort: 1,
};

describe("admin input validation", () => {
  test("rejects malformed editable rows", () => {
    expect(() => validateAdminRow("members", { ...member, org: "ROOT" })).toThrow();
    expect(() => validateAdminRow("news", { slug: "bad slug", title: "ข่าว" })).toThrow();
  });

  test("accepts valid rows and strips system or unexpected fields", () => {
    const result = validateAdminRow("members", {
      ...member,
      created_at: "forged",
      updated_at: "forged",
      is_admin: true,
    });

    expect(result).toMatchObject(member);
    expect(result).not.toHaveProperty("created_at");
    expect(result).not.toHaveProperty("updated_at");
    expect(result).not.toHaveProperty("is_admin");
  });

  test("keeps score values within 0 to 100", () => {
    expect(() =>
      validateScoreBatch({
        month: "AUG",
        scores: [{ house_slug: "st-george", score: 100.1 }],
      }),
    ).toThrow();

    expect(
      validateScoreBatch({
        month: "AUG",
        scores: [{ house_slug: "st-george", score: 100 }],
      }),
    ).toEqual({ month: "AUG", scores: [{ house_slug: "st-george", score: 100 }] });
  });
});
