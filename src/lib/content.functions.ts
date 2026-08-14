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
