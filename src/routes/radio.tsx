import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Section, SectionHead, Tag } from "@/components/site/primitives";
import { RADIO_DAYS, RADIO_SLOTS } from "@/data/sgsc";
import { submitRadioBooking } from "@/lib/content.functions";


export const Route = createFileRoute("/radio")({
  head: () => ({
    meta: [
      { title: "SG Radio — จองคิวเสียงตามสาย | SGSC" },
      { name: "description", content: "จองคิว SG Radio เสียงตามสายช่วงพักกลางวัน ดูตารางออกอากาศ ช่วงเวลาที่ว่าง และกติกาการขอเพลง" },
      { property: "og:title", content: "SG RADIO — เสียงตามสายพักกลางวัน" },
      { property: "og:description", content: "จองคิวขอเพลงและส่งข้อความถึงเพื่อนผ่าน SG Radio" },
    ],
  }),
  component: Radio,
});

const STATE_TH: Record<string, string> = {
  AVAILABLE: "ว่าง",
  BOOKED: "ถูกจอง",
  PENDING: "รออนุมัติ",
  CLOSED: "ปิด",
};

function Radio() {
  const sendBooking = useServerFn(submitRadioBooking);
  const c = useContent();

  const [day, setDay] = useState(RADIO_DAYS[0]!);
  const slot = RADIO_SLOTS[0]!;
  const [form, setForm] = useState({ requester: "", klass: "", song: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const states = c.radioSchedule[day]!;
  const closed = states[0] === "CLOSED";


  return (
    <>
      <Section className="pb-10">
        <Tag>โครงการสโมสรนักเรียน</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,6.5rem)]">SG RADIO</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          เสียงตามสายช่วง 8.05 น. เป็นต้นไป นักเรียนทุกระดับชั้นจองช่วงเวลาเพื่อขอเพลงและส่งข้อความถึงเพื่อนได้
        </p>
      </Section>

      <Section className="pt-0">
        <SectionHead eyebrow="ตารางออกอากาศ" title="WEEKLY SCHEDULE" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="eyebrow border-b border-border p-3 text-left">วัน / เวลา</th>
                {RADIO_SLOTS.map((s) => (
                  <th key={s} className="num border-b border-border p-3 text-left">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RADIO_DAYS.map((d) => (
                <tr key={d}>
                  <td className="border-b border-border p-3 font-semibold">{d}</td>
                  {c.radioSchedule[d]!.map((st, i) => (
                    <td key={i} className="border-b border-border p-3">
                      <span
                        className={
                          st === "AVAILABLE"
                            ? "text-primary"
                            : st === "PENDING"
                              ? "text-muted-foreground"
                              : "text-muted-foreground/60"
                        }
                      >
                        {STATE_TH[st]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="จองคิว" title="BOOK A SLOT" />
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow">เลือกวัน</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RADIO_DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] ${
                    day === d ? "bg-primary text-primary-foreground" : "border border-input bg-background"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="eyebrow mt-8">ช่วงเวลา</p>
            <div className="mt-3 border border-border bg-background p-4">
              <span className="num text-sm">{slot} น. เป็นต้นไป</span>
              <span className="ml-3 text-xs text-muted-foreground">({STATE_TH[states[0]!]})</span>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setStatus("sending");
              setErr("");
              try {
                await sendBooking({ data: { day, slot, ...form } });
                setStatus("sent");
                setForm({ requester: "", klass: "", song: "", message: "" });
              } catch (e2) {
                setErr(e2 instanceof Error ? e2.message : "ส่งคำขอไม่สำเร็จ");
                setStatus("error");
              }
            }}
            className="border border-border bg-background p-7"
          >
            {([
              { k: "requester", l: "ชื่อ-นามสกุล", ph: "ชื่อของคุณ" },
              { k: "klass", l: "ห้องเรียน", ph: "ม.5/1" },
              { k: "song", l: "ชื่อเพลงที่ขอ", ph: "ชื่อเพลง — ศิลปิน" },
            ] as const).map((f) => (
              <label key={f.k} className="mb-5 block">
                <span className="eyebrow">{f.l}</span>
                <input
                  required
                  type="text"
                  value={form[f.k]}
                  onChange={(ev) => setForm((s) => ({ ...s, [f.k]: ev.target.value }))}
                  placeholder={f.ph}
                  maxLength={120}
                  className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
                />
              </label>
            ))}
            <label className="mb-5 block">
              <span className="eyebrow">ข้อความถึงเพื่อน</span>
              <textarea
                rows={4}
                maxLength={400}
                value={form.message}
                onChange={(ev) => setForm((s) => ({ ...s, message: ev.target.value }))}
                placeholder="ข้อความสั้น ๆ ที่เหมาะสมกับบริบทโรงเรียน"
                className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
              />
            </label>
            <p className="num mb-5 text-xs text-muted-foreground">
              ช่วงที่เลือก: {day} {slot}
            </p>
            <button
              type="submit"
              disabled={status === "sending" || closed}
              className="w-full bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-40"
            >
              {closed ? "ช่วงเวลานี้ปิดรับ" : status === "sending" ? "กำลังส่ง…" : "ส่งคำขอจองคิว"}
            </button>
            {status === "sent" && (
              <p className="mt-4 text-sm text-primary">
                ส่งคำขอแล้ว · สถานะ “รออนุมัติ” จากทีมงาน SG Radio
              </p>
            )}
            {status === "error" && <p className="mt-4 text-sm text-destructive">{err}</p>}
          </form>

        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="กติกาการใช้บริการ" title="RADIO RULES" />
        <ol className="max-w-3xl">
          {c.radioRules.map((r, i) => (
            <li key={r} className="flex gap-5 border-t border-border py-5 last:border-b">
              <span className="num text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm">{r}</span>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
