import { createServerFn } from "@tanstack/react-start";

/** Public: the whole site content. */
export const getContent = createServerFn({ method: "GET" }).handler(async () => {
  const { loadContent } = await import("./content.server");
  return loadContent();
});

/** Public: send a SG Radio booking request. */
export const submitRadioBooking = createServerFn({ method: "POST" })
  .inputValidator((data: { day: string; slot: string; requester: string; klass: string; song: string; message: string }) => {
    const trim = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
    const out = {
      day: trim(data.day, 40),
      slot: trim(data.slot, 20),
      requester: trim(data.requester, 120),
      klass: trim(data.klass, 40),
      song: trim(data.song, 200),
      message: trim(data.message, 600),
    };
    if (!out.day || !out.slot || !out.requester) throw new Error("กรอกข้อมูลไม่ครบ");
    return out;
  })
  .handler(async ({ data }) => {
    const { insertRadioBooking } = await import("./content.server.write");
    return insertRadioBooking(data);
  });

/** Public: submit a complaint to the Student Congress. */
export const submitComplaint = createServerFn({ method: "POST" })
  .inputValidator(
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
