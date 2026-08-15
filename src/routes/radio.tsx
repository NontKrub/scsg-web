import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionHead, Tag } from "@/components/site/primitives";
import { RADIO_DAYS, RADIO_SLOTS } from "@/data/sgsc";

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
  const c = useContent();
  const [day, setDay] = useState(RADIO_DAYS[0]!);
  const [slot, setSlot] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const states = c.radioSchedule[day]!;

  return (
    <>
      <Section className="pb-10">
        <Tag>โครงการสโมสรนักเรียน</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,6.5rem)]">SG RADIO</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          เสียงตามสายช่วงพักกลางวัน 12:00–12:50 น. นักเรียนทุกระดับชั้นจองช่วงเวลาเพื่อขอเพลงและส่งข้อความถึงเพื่อนได้
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
                  onClick={() => {
                    setDay(d);
                    setSlot(RADIO_SLOTS[0]!);
                  }}
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
              <span className="num text-sm">{RADIO_SLOTS[0]} น. เป็นต้นไป</span>
              <span className="ml-3 text-xs text-muted-foreground">({STATE_TH[states[0]!]})</span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="border border-border bg-background p-7"
          >
            {[
              { l: "ชื่อ-นามสกุล", t: "text", ph: "ชื่อของคุณ" },
              { l: "ห้องเรียน", t: "text", ph: "ม.5/1" },
              { l: "ชื่อเพลงที่ขอ", t: "text", ph: "ชื่อเพลง — ศิลปิน" },
            ].map((f) => (
              <label key={f.l} className="mb-5 block">
                <span className="eyebrow">{f.l}</span>
                <input
                  required
                  type={f.t}
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
                placeholder="ข้อความสั้น ๆ ที่เหมาะสมกับบริบทโรงเรียน"
                className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
              />
            </label>
            <p className="num mb-5 text-xs text-muted-foreground">
              ช่วงที่เลือก: {day} {slot ?? "— ยังไม่เลือก"}
            </p>
            <button
              type="submit"
              disabled={!slot}
              className="w-full bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-40"
            >
              ส่งคำขอจองคิว
            </button>
            {sent && (
              <p className="mt-4 text-sm text-primary">
                ส่งคำขอแล้ว · สถานะ “รออนุมัติ” จากทีมงาน SG Radio
              </p>
            )}
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
