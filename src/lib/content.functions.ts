import { createServerFn } from "@tanstack/react-start";
import { normalizeRadioBookingInput } from "./radio/service";

/** Public: the whole site content. */
export const getContent = createServerFn({ method: "GET" }).handler(async () => {
  const { loadContent } = await import("./content.server");
  return loadContent();
});

/** Public: date-based SG Radio schedule and rules. */
export const getRadioPageData = createServerFn({ method: "GET" }).handler(async () => {
  const { loadRadioPage } = await import("./content.server");
  return loadRadioPage();
});

/** Public: send a SG Radio booking request. */
export const submitRadioBooking = createServerFn({ method: "POST" })
  .validator((data: unknown) => normalizeRadioBookingInput(data))
  .handler(async ({ data }) => {
    const { insertRadioBooking } = await import("./content.server.write");
    return insertRadioBooking(data);
  });

export function normalizeComplaintInput(data: unknown) {
  const source = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const honeypot = source["website"];
  if (typeof honeypot === "string" && honeypot.trim()) {
    throw new Error("ส่งข้อมูลไม่สำเร็จ");
  }
  const trim = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
  const anonymous = source["anonymous"] === true;
  const out = {
    subject: trim(source["subject"], 160),
    cat: trim(source["cat"], 40) || "OTHER",
    detail: trim(source["detail"], 2_000),
    reporter: anonymous ? "" : trim(source["reporter"], 120),
    klass: anonymous ? "" : trim(source["klass"], 40),
    contact: anonymous ? "" : trim(source["contact"], 160),
    anonymous,
  };
  if (!out.subject || !out.detail) throw new Error("กรอกหัวข้อและรายละเอียดให้ครบ");
  return out;
}

/** Public: submit a complaint to the Student Congress. */
export const submitComplaint = createServerFn({ method: "POST" })
  .validator(normalizeComplaintInput)
  .handler(async ({ data }) => {
    const { insertComplaint } = await import("./content.server.write");
    return insertComplaint(data);
  });
