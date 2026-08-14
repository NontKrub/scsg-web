import { createFileRoute, Link } from "@tanstack/react-router";
import { ImgBlock, Section, SectionHead, Tag } from "@/components/site/primitives";
import { CLUBS } from "@/data/sgsc";

export const Route = createFileRoute("/clubs/")({
  head: () => ({
    meta: [
      { title: "Clubs of Interest — ชุมนุมตามความสนใจ | SGSC" },
      { name: "description", content: "6 ชุมนุมของ Student Congress of Saint Gabriel's College: ASA Saint, Interact, Innovation, MC, Board Game และ Public Relation" },
      { property: "og:title", content: "CLUBS OF INTEREST — SGSC" },
      { property: "og:description", content: "6 ชุมนุมที่เปิดพื้นที่ให้นักเรียนได้ลงมือทำในสิ่งที่รัก" },
    ],
  }),
  component: ClubsIndex,
});

function ClubsIndex() {
  return (
    <>
      <Section className="pb-10">
        <Tag>องค์กรที่ 3</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,6.5rem)]">CLUBS OF INTEREST</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          ชุมนุมตามความสนใจคือพื้นที่ให้นักเรียนได้ทดลอง ลงมือทำ และเติบโตในสิ่งที่รัก
          ทุกชุมนุมมีผู้แทนอยู่ในสภานักเรียนคณะที่ 69
        </p>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {CLUBS.map((c) => (
            <Link
              key={c.slug}
              to="/clubs/$slug"
              params={{ slug: c.slug }}
              className={`${c.cls} group bg-background p-7 transition-colors hover:bg-[var(--house)] hover:text-[var(--house-fg)]`}
            >
              <p className="num text-xs opacity-60">{c.nameTh}</p>
              <h2 className="display-xl mt-4 text-2xl md:text-3xl">{c.name}</h2>
              <p className="mt-3 text-sm opacity-80">{c.tagline}</p>
              <ImgBlock className="mt-6 aspect-[4/3] w-full" />
              <div className="mt-6 flex items-center justify-between border-t border-current/20 pt-4 text-xs">
                <span>หัวหน้าชุมนุม {c.head}</span>
                <span className="num">{c.members} คน</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="เข้าร่วมชุมนุม" title="HOW TO JOIN" />
        <div className="grid gap-px bg-border sm:grid-cols-3">
          {[
            { n: "01", t: "เลือกชุมนุม", d: "ดูรายละเอียดกิจกรรมของแต่ละชุมนุมและเลือกที่ตรงกับความสนใจ" },
            { n: "02", t: "ติดต่อหัวหน้าชุมนุม", d: "แจ้งความประสงค์กับหัวหน้าชุมนุมหรือครูที่ปรึกษา" },
            { n: "03", t: "เริ่มกิจกรรม", d: "เข้าร่วมกิจกรรมประจำสัปดาห์ตามตารางของชุมนุม" },
          ].map((s) => (
            <div key={s.n} className="bg-background p-7">
              <p className="num text-3xl text-muted-foreground">{s.n}</p>
              <p className="mt-5 font-semibold">{s.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
