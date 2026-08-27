import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Section, SectionHead } from "@/components/site/primitives";
import { submitComplaint } from "@/lib/content.functions";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "ส่งเรื่องร้องเรียน — สภานักเรียน | SGSC" },
      {
        name: "description",
        content:
          "ส่งเรื่องร้องเรียน ข้อเสนอแนะ หรือปัญหาถึงสภานักเรียนโรงเรียนเซนต์คาเบรียล ระบุชื่อหรือไม่ระบุชื่อก็ได้",
      },
      { property: "og:title", content: "ส่งเรื่องร้องเรียน — สภานักเรียน SGSC" },
      {
        property: "og:description",
        content: "ช่องทางร้องเรียนและเสนอแนะถึงสภานักเรียนโรงเรียนเซนต์คาเบรียล",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComplaintsPage,
});

export const COMPLAINT_CATS = [
  { value: "FACILITY", label: "อาคารสถานที่ / อุปกรณ์" },
  { value: "ACADEMIC", label: "การเรียนการสอน" },
  { value: "ACTIVITY", label: "กิจกรรม / บ้านสายกีฬา / ชุมนุม" },
  { value: "WELFARE", label: "สวัสดิการนักเรียน" },
  { value: "SAFETY", label: "ความปลอดภัย / การถูกกลั่นแกล้ง" },
  { value: "SUGGESTION", label: "ข้อเสนอแนะ" },
  { value: "OTHER", label: "อื่น ๆ" },
] as const;

function ComplaintsPage() {
  const send = useServerFn(submitComplaint);
  const [anonymous, setAnonymous] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    cat: "FACILITY",
    detail: "",
    reporter: "",
    klass: "",
    contact: "",
    website: "",
  });
  const [done, setDone] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => send({ data: { ...form, anonymous } }),
    onSuccess: () => {
      setDone(true);
      setForm({
        subject: "",
        cat: "FACILITY",
        detail: "",
        reporter: "",
        klass: "",
        contact: "",
        website: "",
      });
      toast.success("ส่งเรื่องร้องเรียนแล้ว");
    },
    onError: (e: Error) => toast.error(e.message || "ส่งไม่สำเร็จ กรุณาลองอีกครั้ง"),
  });

  return (
    <>
      <Section className="pt-14 md:pt-20">
        <SectionHead eyebrow="ช่องทางร้องเรียน" title="FILE A COMPLAINT" />
        <p className="max-w-2xl text-sm text-muted-foreground">
          แจ้งปัญหา ข้อร้องเรียน หรือข้อเสนอแนะถึงสภานักเรียน ทุกเรื่องจะถูกส่งถึงคณะกรรมการโดยตรง
          และเก็บเป็นความลับ
        </p>
      </Section>

      <Section className="bg-secondary pt-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="max-w-3xl border border-border bg-background p-7 md:p-9"
        >
          <label className="absolute -left-[9999px]" aria-hidden="true">
            <span>Website</span>
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={set("website")}
            />
          </label>
          <label className="mb-5 block">
            <span className="eyebrow">หัวข้อเรื่อง *</span>
            <input
              required
              value={form.subject}
              onChange={set("subject")}
              maxLength={160}
              placeholder="สรุปเรื่องสั้น ๆ"
              className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
            />
          </label>

          <label className="mb-5 block">
            <span className="eyebrow">หมวดเรื่อง</span>
            <select
              value={form.cat}
              onChange={set("cat")}
              className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
            >
              {COMPLAINT_CATS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mb-5 block">
            <span className="eyebrow">รายละเอียด *</span>
            <textarea
              required
              rows={6}
              value={form.detail}
              onChange={set("detail")}
              maxLength={2000}
              placeholder="เล่าเหตุการณ์ สถานที่ เวลา และสิ่งที่ต้องการให้ช่วยเหลือ"
              className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
            />
          </label>

          <label className="mb-6 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            ไม่ระบุชื่อผู้ร้องเรียน
          </label>

          {!anonymous && (
            <div className="grid gap-5 md:grid-cols-3">
              <label className="block">
                <span className="eyebrow">ชื่อ-นามสกุล</span>
                <input
                  value={form.reporter}
                  onChange={set("reporter")}
                  maxLength={120}
                  className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
                />
              </label>
              <label className="block">
                <span className="eyebrow">ชั้น/ห้อง</span>
                <input
                  value={form.klass}
                  onChange={set("klass")}
                  maxLength={40}
                  placeholder="ม.5/1"
                  className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
                />
              </label>
              <label className="block">
                <span className="eyebrow">ช่องทางติดต่อกลับ</span>
                <input
                  value={form.contact}
                  onChange={set("contact")}
                  maxLength={160}
                  placeholder="อีเมล / LINE"
                  className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
                />
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-8 w-full bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-40"
          >
            {mutation.isPending ? "กำลังส่ง…" : "ส่งเรื่องร้องเรียน"}
          </button>

          {done && (
            <p className="mt-4 text-sm text-primary">
              ได้รับเรื่องแล้ว · สถานะ “เรื่องใหม่” รอการตรวจสอบจากสภานักเรียน
            </p>
          )}
        </form>
      </Section>
    </>
  );
}
