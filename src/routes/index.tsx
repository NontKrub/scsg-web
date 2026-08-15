import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { OrgMap } from "@/components/site/OrgMap";
import { HouseGrid } from "@/components/site/HouseGrid";
import { MemberGrid } from "@/components/site/MemberGrid";
import { ScoreTable } from "@/components/site/ScoreBoard";
import congressGroup from "@/assets/congress-group.jpg.asset.json";
import scsgSeal from "@/assets/scsg-seal.png.asset.json";
import { ImgBlock, Section, SectionHead, Stat, Tag } from "@/components/site/primitives";
import { MONTH_TH } from "@/data/sgsc";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SGSC — สภานักเรียนโรงเรียนเซนต์คาเบรียล" },
      {
        name: "description",
        content:
          "FOR SAINTS. BY SAINTS. เว็บไซต์ทางการของสภานักเรียนโรงเรียนเซนต์คาเบรียล 68 ผู้นำนักเรียน 4 องค์กร 9 บ้านสายกีฬา",
      },
      { property: "og:title", content: "FOR SAINTS. BY SAINTS. — SGSC" },
      { property: "og:description", content: "68 ผู้นำนักเรียน · 4 องค์กร · 9 บ้านสายกีฬา" },
    ],
  }),
  component: Home,
});

function Home() {
  const c = useContent();
  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-border">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pt-14 pb-16 md:px-10 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:pb-24">
          <div className="rise">
            <div className="flex items-center gap-4">
              <img
                src={scsgSeal.url}
                alt="ตราสัญลักษณ์สภานักเรียนโรงเรียนเซนต์คาเบรียล S.C.S.G."
                className="h-16 w-16 md:h-20 md:w-20"
              />
              <Tag>Student Congress · S.C.S.G.</Tag>
            </div>
            <h1 className="display-xl mt-6 text-[clamp(3.2rem,11vw,8.5rem)]">
              FOR SAINTS.
              <br />
              BY SAINTS.
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
              สภานักเรียนโรงเรียนเซนต์คาเบรียล
              <br />
              Student Congress of Saint Gabriel&apos;s College
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6">
              <Stat value={String(c.members.length)} label="ผู้นำนักเรียน" />
              <Stat value="04" label="องค์กร" />
              <Stat value="09" label="บ้านสายกีฬา" />
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                รู้จัก SGSC <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/members"
                className="inline-flex items-center gap-2 border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-primary"
              >
                สมาชิกสภา 68 คน
              </Link>
            </div>
          </div>
          <ImgBlock
            className="aspect-[4/5] w-full lg:aspect-[3/4]"
            src={congressGroup.url}
            alt="สมาชิกสภานักเรียนโรงเรียนเซนต์คาเบรียลถ่ายภาพหมู่ที่สนามโรงเรียน"
            label="congress"
          />
        </div>
      </section>

      {/* ORG MAP */}
      <Section>
        <SectionHead
          eyebrow="โครงสร้างองค์กร"
          title={
            <>
              68 PEOPLE. 4 ORGANIZATIONS.
              <br />
              ONE CONGRESS.
            </>
          }
          sub="SGSC ประกอบด้วย 4 องค์กรหลักที่ทำงานร่วมกัน เลื่อนเมาส์ไปที่แต่ละองค์กรเพื่อดูรายละเอียด"
        />
        <OrgMap />
      </Section>

      {/* HOUSE SCORE HIGHLIGHT */}
      <Section className="bg-secondary">
        <SectionHead
          eyebrow={`ประจำเดือน${MONTH_TH[c.currentMonth]} 2026`}
          title="HOUSE COMPETITION"
          right={
            <Link
              to="/competition"
              className="inline-flex items-center gap-2 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground"
            >
              ดูผลทั้งหมด <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <ScoreTable month={c.currentMonth} limit={3} />
      </Section>


      {/* c.houses */}
      <Section className="bg-navy-deep text-primary-foreground">
        <div className="mb-10 flex flex-col gap-6 border-t border-primary-foreground/20 pt-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display-xl text-[clamp(1.9rem,5vw,3.6rem)]">
            09 c.houses.
            <br />
            ONE SAINT GABRIEL&apos;S.
          </h2>
          <Link
            to="/houses"
            className="inline-flex shrink-0 items-center gap-2 border border-primary-foreground/40 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            ดูบ้านทั้งหมด <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="bg-background">
          <HouseGrid month={c.currentMonth} />
        </div>
      </Section>

      {/* CONGRESS BOARD */}
      <Section>
        <SectionHead
          eyebrow="คณะกรรมการบริหารสภา"
          title="THE CONGRESS BOARD."
          sub="5 ตำแหน่งบริหารของสภานักเรียนใหญ่ เลือกจากสมาชิกสภาทั้ง 68 คน จาก 4 องค์กร"
        />
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3 lg:grid-cols-5">
          {c.congressBoard.map((b) => (
            <div key={b.role} className="bg-background p-4">
              <ImgBlock className="aspect-[3/4] w-full" />
              <p className="mt-4 text-sm font-semibold">{b.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.role}</p>
              <p className="mt-1 text-[0.68rem] text-muted-foreground">มาจาก{b.fromOrg}</p>
              <p className="num mt-2 text-xs text-muted-foreground">{b.klass}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ADVISORY BOARD */}
      <Section className="bg-secondary">
        <SectionHead
          eyebrow="ที่ปรึกษา"
          title="ADVISORY BOARD"
          sub="คณะที่ปรึกษาของสภา ให้คำแนะนำเชิงนโยบายและกำกับดูแลการทำงาน"
        />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {c.advisoryBoard.map((a) => (
            <div key={a.name} className="bg-background p-7">
              <ImgBlock className="mb-6 aspect-[4/3] w-full" />
              <p className="eyebrow">{a.role}</p>
              <p className="mt-3 text-lg font-semibold">{a.name}</p>
              <p className="mt-3 text-sm text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* c.members */}
      <Section className="bg-secondary">
        <SectionHead
          eyebrow="สมาชิกสภา"
          title={
            <>
              68 PEOPLE.
              <br />
              ONE CONGRESS.
            </>
          }
          right={
            <Link
              to="/members"
              className="inline-flex items-center gap-2 border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              หน้าสมาชิกทั้งหมด
            </Link>
          }
          sub="สโมสรนักเรียน 18 · ประธานบ้านสายกีฬา 9 · ผู้แทนชุมนุม 18 · ผู้แทนห้องเรียน 23"
        />
        <div className="mb-12 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            { n: "18", t: "STUDENT GOVERNMENT", th: "สโมสรนักเรียน" },
            { n: "09", t: "HOUSE PRESIDENTS", th: "ประธานบ้านสายกีฬา 9 บ้าน" },
            { n: "18", t: "CLUB REPRESENTATIVES", th: "6 ชุมนุม" },
            { n: "23", t: "CLASS REPRESENTATIVES", th: "ผู้แทนห้องเรียน" },
          ].map((x) => (
            <div key={x.t} className="bg-background p-6">
              <div className="num text-4xl">{x.n}</div>
              <p className="num mt-4 text-xs">{x.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{x.th}</p>
            </div>
          ))}
        </div>
        <MemberGrid />

      </Section>

      {/* c.clubs */}
      <Section>
        <SectionHead eyebrow="ชุมนุมตามความสนใจ" title="CLUBS OF INTEREST" />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {c.clubs.map((club, ci) => (
            <Link
              key={club.slug}
              to="/clubs/$slug"
              params={{ slug: club.slug }}
              className={`${club.cls} group bg-background p-6 transition-colors hover:bg-[var(--house)] md:p-8`}
            >
              <div className="flex items-baseline justify-between">
                <span className="num text-4xl text-muted-foreground transition-colors group-hover:text-white/70">
                  {String(ci + 1).padStart(2, "0")}
                </span>
                <span className="h-8 w-8 bg-[var(--house)] transition-colors group-hover:bg-white/80" />
              </div>
              <h3 className="display-xl mt-10 text-2xl transition-colors group-hover:text-white">{club.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground transition-colors group-hover:text-white/80">
                {club.nameTh} · {club.tagline}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {/* c.news */}
      <Section className="bg-secondary">
        <SectionHead
          eyebrow="ข่าวและอัปเดต"
          title="NOW AT SGSC"
          right={
            <Link
              to="/news"
              className="inline-flex items-center gap-2 border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              ข่าวทั้งหมด
            </Link>
          }
        />
        <div className="grid gap-8 md:grid-cols-3">
          {c.news.slice(0, 3).map((n) => (
            <Link key={n.slug} to="/news/$slug" params={{ slug: n.slug }} className="group">
              <div className="mt-5 flex items-center gap-3">
                <Tag>{n.cat}</Tag>
                <span className="text-xs text-muted-foreground">{n.date}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold leading-snug transition-opacity group-hover:opacity-60">
                {n.title}
              </h3>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
