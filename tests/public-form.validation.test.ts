import { describe, expect, test } from "bun:test";
import { normalizeComplaintInput } from "@/lib/content.functions";

describe("public form validation", () => {
  test("rejects complaint honeypot submissions", () => {
    expect(() =>
      normalizeComplaintInput({
        subject: "หัวข้อ",
        cat: "OTHER",
        detail: "รายละเอียด",
        reporter: "",
        klass: "",
        contact: "",
        anonymous: true,
        website: "https://bot.invalid",
      }),
    ).toThrow();
  });

  test("normalizes a valid anonymous complaint", () => {
    expect(
      normalizeComplaintInput({
        subject: "  หัวข้อ  ",
        cat: "OTHER",
        detail: "รายละเอียด",
        reporter: "ไม่ควรเก็บ",
        klass: "ม.5/1",
        contact: "contact",
        anonymous: true,
        website: "",
      }),
    ).toEqual({
      subject: "หัวข้อ",
      cat: "OTHER",
      detail: "รายละเอียด",
      reporter: "",
      klass: "",
      contact: "",
      anonymous: true,
    });
  });
});
