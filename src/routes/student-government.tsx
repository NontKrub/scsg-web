import { createFileRoute, Link } from "@tanstack/react-router";
import { MemberGrid } from "@/components/site/MemberGrid";
import { ImgBlock, Section, SectionHead, Tag } from "@/components/site/primitives";
import { PROJECTS } from "@/data/sgsc";

export const Route = createFileRoute("/student-government")({
  head: () => ({
    meta: [
      { title: "Student Government — สภานักเรียน | SGSC" },
      { name: "description", content: "ฝ่ายบริหารของ SGSC ดูแลโครงการและบริการเพื่อนักเรียนทั้งโรงเรียน พร้อมรายชื่อคณะทำงานและโครงการที่ดำเนินอยู่" },
      { property: "og:title", content: "STUDENT GOVERNMENT — SGSC" },
      { property: "og:description", content: "โครงสร้าง คณะทำงาน และโครงการของสภานักเรียนคณะที่ 69" },
    ],
  }),
  component: SG,
});

function SG() {
  return (
    <>
      <Section className="pb-10">
        <Tag>องค์กรที่ 1</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,6.5rem)]">STUDENT GOVERNMENT</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          สภานักเรียนคือฝ่ายบริหารของ SGSC ทำหน้าที่ริเริ่มโครงการ ดูแลบริการนักเรียน
          และประสานงานระหว่างนักเรียนกับฝ่ายบริหารโรงเรียน
        </p>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "ฝ่ายบริหาร", d: "ประธาน รองประธาน และเลขาธิการ" },
            { t: "ฝ่ายกิจกรรม", d: "ออกแบบและจัดกิจกรรมประจำภาคเรียน" },
            { t: "ฝ่ายสื่อสาร", d: "ดูแล SG Radio และช่องทางประชาสัมพันธ์" },
            { t: "ฝ่ายวิชาการ", d: "ส่งเสริมการเรียนรู้และติวเตอร์เพื่อน" },
          ].map((x) => (
            <div key={x.t} className="bg-background p-7">
              <p className="font-semibold">{x.t}</p>
              <p className="mt-3 text-sm text-muted-foreground">{x.d}</p>
              <ImgBlock className="mt-6 aspect-[4/3] w-full" />
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="โครงการของสภานักเรียน" title="OUR PROJECTS" />
        <div className="grid gap-px bg-border md:grid-cols-3">
          {PROJECTS.filter((p) => p.org === "สภานักเรียน").map((p) => (
            <div key={p.slug} className="bg-background p-7">
              <Tag>{p.status}</Tag>
              <h3 className="display-xl mt-5 text-2xl">{p.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              <p className="num mt-6 text-xs text-muted-foreground">
                {p.start} — {p.end}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/radio"
            className="inline-flex bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground"
          >
            จองคิว SG Radio
          </Link>
          <Link
            to="/news"
            className="inline-flex border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            ข่าวสภานักเรียน
          </Link>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="คณะทำงาน" title="SG MEMBERS" />
        <MemberGrid initial="SG" />
      </Section>
    </>
  );
}
