import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { OrgMap } from "@/components/site/OrgMap";
import congressGroup from "@/assets/congress-group.jpg.asset.json";
import scsgSeal from "@/assets/scsg-seal.png.asset.json";
import { ImgBlock, Section, SectionHead, Stat, Tag } from "@/components/site/primitives";
import { ORG_MEMBER_TYPES, ORGS } from "@/data/sgsc";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "เกี่ยวกับ SGSC — สภานักเรียนเซนต์คาเบรียล" },
      {
        name: "description",
        content: "นักเรียน 4 องค์กร หนึ่งสภา โครงสร้างและคณะกรรมการบริหารของ SGSC",
      },
      { property: "og:title", content: "เกี่ยวกับ SGSC" },
      { property: "og:description", content: "STUDENTS. 4 ORGANIZATIONS. ONE CONGRESS." },
    ],
  }),
  component: About,
});

function About() {
  const c = useContent();
  return (
    <>
      <Section className="pb-10">
        <img
          src={scsgSeal.url}
          alt="ตราสัญลักษณ์สภานักเรียนโรงเรียนเซนต์คาเบรียล S.C.S.G."
          className="mb-8 h-28 w-28 md:h-36 md:w-36"
        />
        <Tag>About SGSC</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.4rem,8vw,6rem)]">
          {c.members.length} STUDENTS.
          <br />
          4 ORGANIZATIONS.
          <br />
          ONE CONGRESS.
        </h1>
        <p className="mt-8 max-w-xl text-base text-muted-foreground md:text-lg">
          SGSC คือสภานักเรียนโรงเรียนเซนต์คาเบรียล ทำหน้าที่เป็นตัวแทนของนักเรียนทุกคน
          และเป็นศูนย์กลางประสานงานระหว่างองค์กรนักเรียนทั้งสี่
        </p>
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          <Stat value={String(c.members.length)} label="สมาชิกสภา" />
          <Stat value={String(ORGS.length).padStart(2, "0")} label="องค์กรหลัก" />
          <Stat value={String(c.houses.length).padStart(2, "0")} label="บ้านสายกีฬา" />
          <Stat value={String(c.clubs.length).padStart(2, "0")} label="ชุมนุม" />
        </div>
      </Section>

      <Section className="pt-4">
        <ImgBlock
          className="aspect-[16/7] w-full"
          src={congressGroup.url}
          alt="สมาชิกสภานักเรียนเซนต์คาเบรียลถ่ายภาพหมู่พร้อมป้ายสภานักเรียน"
          label="congress"
        />
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="โครงสร้าง" title="ORGANIZATION MAP" />
        <OrgMap />
      </Section>

      <Section>
        <SectionHead
          eyebrow="คณะกรรมการบริหารสภา"
          title="CONGRESS BOARD — 5 ตำแหน่ง"
          sub={`คณะกรรมการบริหารสภา 5 คน เลือกจากสมาชิกสภาทั้ง ${c.members.length} คน ทำหน้าที่กำกับภาพรวมของทั้ง 4 องค์กร`}
        />
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3 lg:grid-cols-5">
          {c.congressBoard.map((b) => (
            <div key={b.role} className="bg-background p-4">
              <ImgBlock src={b.photoUrl} alt={b.name} className="aspect-[3/4] w-full" />
              <p className="mt-4 text-sm font-semibold">{b.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.role}</p>
              <p className="mt-1 text-[0.68rem] text-muted-foreground">มาจาก{b.fromOrg}</p>
              <p className="num mt-2 text-xs text-muted-foreground">{b.klass}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead
          eyebrow="ที่ปรึกษา"
          title="ADVISORY BOARD"
          sub="คณะที่ปรึกษาให้คำแนะนำและกำกับดูแลการทำงานของสภา"
        />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {c.advisoryBoard.map((a) => (
            <div key={a.name} className="bg-background p-7">
              <ImgBlock src={a.photoUrl} alt={a.name} className="mb-6 aspect-[4/3] w-full" />
              <p className="eyebrow">{a.role}</p>
              <p className="mt-3 text-lg font-semibold">{a.name}</p>
              <p className="mt-3 text-sm text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="ลำดับโครงสร้าง" title="HOW IT FITS TOGETHER" />
        <div className="grid gap-px bg-border md:grid-cols-3">
          {[
            {
              t: `STUDENT CONGRESS · ${c.members.length} คน`,
              d: "องค์กรใหญ่สุด รวมสมาชิกจาก 4 องก์กร นำโดยคณะกรรมการบริหารสภา 5 ตำแหน่ง และมีคณะที่ปรึกษากำกับดูแล",
            },
            {
              t: `STUDENT GOVERNMENT · ${membersOf(c, "SG").length} คน`,
              d: "หนึ่งใน 4 องค์กรภายใต้สภา เป็นฝ่ายบริหาร ตั้งแต่นายกสโมสรนักเรียนจนถึงกรรมการฝ่าย ดูแลกิจกรรมและบริการเช่น SG RADIO",
            },
            {
              t: "HOUSES · CLUBS · CLASS REPS",
              d: "อีก 3 องค์กรที่ส่งผู้แทนเข้าเป็นสมาชิกสภา ทำงานร่วมกับสภานักเรียนในระดับกิจกรรม",
            },
          ].map((x) => (
            <div key={x.t} className="bg-background p-7">
              <p className="num text-sm">{x.t}</p>
              <p className="mt-3 text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-navy-deep text-primary-foreground">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="display-xl text-[clamp(1.9rem,5vw,3.4rem)]">CONGRESS MEMBERS</h2>
            <p className="mt-5 max-w-md text-primary-foreground/70">
              สมาชิกสภาทั้งหมด {c.members.length} คน มาจากสโมสรนักเรียน บ้านสายกีฬา ชุมนุม
              และผู้แทนห้องเรียน
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-primary-foreground/15">
            {ORGS.map((o) => (
              <div key={o.slug} className="bg-navy-deep p-6">
                <div className="num text-4xl">{membersOf(c, ORG_MEMBER_TYPES[o.slug]).length}</div>
                <p className="num mt-3 text-sm">{o.name}</p>
                <p className="mt-1 text-xs text-primary-foreground/60">{o.nameTh}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="ตัวเลข" title="ONE CONGRESS, MANY VOICES." />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <Stat
            value={String(c.members.filter((m) => m.org === "SG").length)}
            label="สโมสรนักเรียน"
          />
          <Stat
            value={String(c.members.filter((m) => m.org === "HOUSE").length)}
            label="คณะกรรมการบ้าน"
          />
          <Stat
            value={String(c.members.filter((m) => m.org === "CLUB").length)}
            label="ผู้แทนชุมนุม"
          />
          <Stat
            value={String(c.members.filter((m) => m.org === "CLASS").length)}
            label="ผู้แทนห้องเรียน"
          />
        </div>
      </Section>
    </>
  );
}
