import { createFileRoute, Link } from "@tanstack/react-router";
import { MemberGrid } from "@/components/site/MemberGrid";
import { ImgBlock, Section, SectionHead, Tag } from "@/components/site/primitives";
import { PROJECTS, SG_MEMBERS, SG_TOTAL, TOTAL_MEMBERS } from "@/data/sgsc";

export const Route = createFileRoute("/student-government")({
  head: () => ({
    meta: [
      { title: "Student Government — สโมสรนักเรียน | SGSC" },
      { name: "description", content: "ฝ่ายบริหารของ SGSC ดูแลโครงการและบริการเพื่อนักเรียนทั้งโรงเรียน พร้อมรายชื่อคณะทำงานและโครงการที่ดำเนินอยู่" },
      { property: "og:title", content: "STUDENT GOVERNMENT — SGSC" },
      { property: "og:description", content: "โครงสร้าง คณะทำงาน และโครงการของสโมสรนักเรียนคณะที่ 69" },
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
          สโมสรนักเรียน (Student Government) คือฝ่ายบริหารซึ่งเป็น 1 ใน 4 องค์กรภายใต้ Student Congress
          มีสมาชิก {SG_TOTAL} คน ตั้งแต่นายกสโมสรนักเรียน รองนายก เลขานุการ เหรัญญิก หัวหน้าฝ่าย จนถึงกรรมการฝ่าย
          และทั้ง {SG_TOTAL} คนนี้นับเป็นสมาชิกสภาใน {TOTAL_MEMBERS} คนของ Student Congress ด้วย
        </p>
        <div className="mt-8 grid max-w-md grid-cols-2 gap-6">
          <div>
            <div className="num text-5xl">{SG_TOTAL}</div>
            <div className="eyebrow mt-1">สมาชิกสโมสรนักเรียน</div>
          </div>
          <div>
            <div className="num text-5xl">{TOTAL_MEMBERS}</div>
            <div className="eyebrow mt-1">สมาชิกสภาใหญ่ทั้งหมด</div>
          </div>
        </div>
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

      <Section>
        <SectionHead
          eyebrow="โครงสร้าง 18 ที่นั่ง"
          title="THE 18 SEATS"
          sub={`สโมสรนักเรียนมีสมาชิก ${SG_TOTAL} คน แบ่งเป็นฝ่ายบริหาร หัวหน้าฝ่าย และกรรมการฝ่าย ทุกคนเป็นสมาชิกสภาใหญ่ ${TOTAL_MEMBERS} คนด้วย`}
        />
        <div className="grid gap-px bg-border md:grid-cols-3">
          {[
            { t: "ฝ่ายบริหาร", range: [0, 5] as const },
            { t: "หัวหน้าฝ่าย", range: [5, 10] as const },
            { t: "กรรมการฝ่าย", range: [10, 18] as const },
          ].map((g) => (
            <div key={g.t} className="bg-background p-7">
              <p className="eyebrow">{g.t}</p>
              <div className="mt-6 divide-y divide-border">
                {SG_MEMBERS.slice(g.range[0], g.range[1]).map((m) => (
                  <div key={m.id} className="flex items-baseline justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">{m.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{m.role}</p>
                    </div>
                    <span className="num text-xs text-muted-foreground">{m.klass}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-navy-deep text-primary-foreground">
        <p className="eyebrow text-primary-foreground/60">องค์กรใหญ่ใต้สภา</p>
        <h2 className="display-xl mt-4 text-[clamp(1.9rem,5vw,3.4rem)]">BIG ORG. BIG PROJECTS.</h2>
        <div className="mt-10 grid gap-px bg-primary-foreground/15 md:grid-cols-3">
          {[
            { n: "01", t: "SG RADIO", d: "สถานีวิทยุพักกลางวัน จองคิวขอเพลงและส่งข้อความ" },
            { n: "02", t: "SAINT MARKET", d: "ตลาดนักเรียนประจำภาคเรียน เปิดพื้นที่ให้ทุกคนขายและแสดงผลงาน" },
            { n: "03", t: "VOICE BOX", d: "รวบรวมเสียงนักเรียนจากผู้แทนห้องเรียนมาสู่การลงมือทำ" },
          ].map((x) => (
            <div key={x.t} className="bg-navy-deep p-7">
              <span className="num text-3xl text-primary-foreground/40">{x.n}</span>
              <h3 className="display-xl mt-8 text-2xl">{x.t}</h3>
              <p className="mt-3 text-sm text-primary-foreground/70">{x.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="โครงการของสโมสรนักเรียน" title="OUR PROJECTS" />
        <div className="grid gap-px bg-border md:grid-cols-3">
          {PROJECTS.filter((p) => p.org === "สโมสรนักเรียน").map((p) => (
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
            to="/news"
            className="inline-flex border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            ข่าวสโมสรนักเรียน
          </Link>
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="โครงการเรือธงของสโมสรนักเรียน"
          title="SG RADIO"
          sub="SG Radio เป็นโครงการของสโมสรนักเรียนโดยเฉพาะ ดูแลโดยฝ่ายสื่อสาร เปิดให้นักเรียนจองคิวขอเพลงและส่งข้อความช่วงพักกลางวัน"
        />
        <div className="grid gap-px bg-border lg:grid-cols-[1.1fr_1fr]">
          <div className="bg-background p-7 md:p-10">
            <ImgBlock className="aspect-[16/9] w-full" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/radio"
                className="inline-flex bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground"
              >
                จองคิว SG Radio
              </Link>
              <Link
                to="/radio"
                className="inline-flex border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                ตารางออกอากาศและกติกา
              </Link>
            </div>
          </div>
          <div className="bg-background p-7 md:p-10">
            <p className="eyebrow">ผู้รับผิดชอบ</p>
            <p className="mt-3 font-semibold">ฝ่ายสื่อสาร สโมสรนักเรียน</p>
            <p className="mt-6 text-sm text-muted-foreground">
              ออกอากาศทุกวันจันทร์–ศุกร์ ช่วงพักกลางวัน 12:00–12:40 น. บริหารจัดการคิวผ่านระบบจองออนไลน์ของสโมสรนักเรียน
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="คณะทำงาน" title={`SG MEMBERS · ${SG_TOTAL} คน`} />
        <MemberGrid initial="SG" />
      </Section>
    </>
  );
}
