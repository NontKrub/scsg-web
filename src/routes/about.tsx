import { createFileRoute, Link } from "@tanstack/react-router";
import { OrgMap } from "@/components/site/OrgMap";
import { ImgBlock, Section, SectionHead, Stat, Tag } from "@/components/site/primitives";
import { EXEC_BOARD, MEMBERS, ORGS, TOTAL_MEMBERS } from "@/data/sgsc";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "เกี่ยวกับ SGSC — สภานักเรียนเซนต์คาเบรียล" },
      {
        name: "description",
        content: "68 นักเรียน 4 องค์กร หนึ่งสภา โครงสร้างและคณะกรรมการบริหารของ SGSC",
      },
      { property: "og:title", content: "เกี่ยวกับ SGSC" },
      { property: "og:description", content: "68 STUDENTS. 4 ORGANIZATIONS. ONE CONGRESS." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <Section className="pb-10">
        <Tag>About SGSC</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.4rem,8vw,6rem)]">
          68 STUDENTS.
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
          <Stat value={String(TOTAL_MEMBERS)} label="สมาชิกสภา" />
          <Stat value="04" label="องค์กรหลัก" />
          <Stat value="09" label="บ้านนักบุญ" />
          <Stat value="06" label="ชมรม" />
        </div>
      </Section>

      <Section className="pt-4">
        <ImgBlock className="aspect-[16/7] w-full" />
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="โครงสร้าง" title="ORGANIZATION MAP" />
        <OrgMap />
      </Section>

      <Section>
        <SectionHead eyebrow="ผู้บริหารสภา" title="EXECUTIVE BOARD" />
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3 lg:grid-cols-5">
          {EXEC_BOARD.map((m) => (
            <div key={m.id} className="bg-background p-4">
              <ImgBlock className="aspect-[3/4] w-full" />
              <p className="mt-4 text-sm font-semibold">{m.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.role}</p>
              <p className="num mt-2 text-xs text-muted-foreground">{m.klass}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-navy-deep text-primary-foreground">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="display-xl text-[clamp(1.9rem,5vw,3.4rem)]">CONGRESS MEMBERS</h2>
            <p className="mt-5 max-w-md text-primary-foreground/70">
              สมาชิกสภาทั้งหมด {TOTAL_MEMBERS} คน มาจากสภานักเรียน คณะสีนักบุญ ชมรม และผู้แทนห้องเรียน
            </p>
            <Link
              to="/members"
              className="mt-8 inline-flex border border-primary-foreground/40 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              ดูสมาชิกทั้งหมด
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-px bg-primary-foreground/15">
            {ORGS.map((o) => (
              <div key={o.slug} className="bg-navy-deep p-6">
                <div className="num text-4xl">{o.count}</div>
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
          <Stat value={String(MEMBERS.filter((m) => m.org === "SG").length)} label="สภานักเรียน" />
          <Stat value={String(MEMBERS.filter((m) => m.org === "HOUSE").length)} label="คณะกรรมการบ้าน" />
          <Stat value={String(MEMBERS.filter((m) => m.org === "CLUB").length)} label="ผู้แทนชมรม" />
          <Stat value={String(MEMBERS.filter((m) => m.org === "CLASS").length)} label="ผู้แทนห้องเรียน" />
        </div>
      </Section>
    </>
  );
}
