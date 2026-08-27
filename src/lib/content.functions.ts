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

/** Public: submit a complaint to the Student Congress. */
export const submitComplaint = createServerFn({ method: "POST" })
  .validator(
    (data: {
      subject: string;
      cat: string;
      detail: string;
      reporter: string;
      klass: string;
      contact: string;
      anonymous: boolean;
    }) => {
      const trim = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
      const anonymous = !!data.anonymous;
      const out = {
        subject: trim(data.subject, 160),
        cat: trim(data.cat, 40) || "OTHER",
        detail: trim(data.detail, 2000),
        reporter: anonymous ? "" : trim(data.reporter, 120),
        klass: anonymous ? "" : trim(data.klass, 40),
        contact: anonymous ? "" : trim(data.contact, 160),
        anonymous,
      };
      if (!out.subject || !out.detail) throw new Error("กรอกหัวข้อและรายละเอียดให้ครบ");
      return out;
    },
  )
  .handler(async ({ data }) => {
    const { insertComplaint } = await import("./content.server.write");
    return insertComplaint(data);
  });
