import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { OrgMap } from "@/components/site/OrgMap";
import { HouseGrid } from "@/components/site/HouseGrid";
import { MemberGrid } from "@/components/site/MemberGrid";
import { ScoreTable } from "@/components/site/ScoreBoard";
import { ImgBlock, Section, SectionHead, Stat, Tag } from "@/components/site/primitives";
import {
  CLUBS,
  CURRENT_MONTH,
  EXEC_BOARD,
  MONTH_TH,
  NEWS,
  PROJECTS,
  TOTAL_MEMBERS,
} from "@/data/sgsc";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SGSC — สภานักเรียนโรงเรียนเซนต์คาเบรียล" },
      {
        name: "description",
        content:
          "FOR SAINTS. BY SAINTS. เว็บไซต์ทางการของสภานักเรียนโรงเรียนเซนต์คาเบรียล 68 ผู้นำนักเรียน 4 องค์กร 9 บ้านนักบุญ",
      },
      { property: "og:title", content: "FOR SAINTS. BY SAINTS. — SGSC" },
      { property: "og:description", content: "68 ผู้นำนักเรียน · 4 องค์กร · 9 บ้านนักบุญ" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-border">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pt-14 pb-16 md:px-10 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:pb-24">
          <div className="rise">
            <Tag>Student Congress · S.C.S.G.</Tag>
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
              <Stat value={String(TOTAL_MEMBERS)} label="ผู้นำนักเรียน" />
              <Stat value="04" label="องค์กร" />
              <Stat value="09" label="บ้านนักบุญ" />
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                รู้จัก SGSC <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/radio"
                className="inline-flex items-center gap-2 border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-primary"
              >
                จองคิว SG Radio
              </Link>
            </div>
          </div>
          <ImgBlock className="aspect-[4/5] w-full lg:aspect-[3/4]" />
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
          eyebrow={`ประจำเดือน${MONTH_TH[CURRENT_MONTH]} 2026`}
          title="HOUSE CHAMPIONSHIP"
          right={
            <Link
              to="/championship"
              className="inline-flex items-center gap-2 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground"
            >
              ดูผลทั้งหมด <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <ScoreTable month={CURRENT_MONTH} limit={3} />
      </Section>

      {/* PROJECTS */}
      <Section>
        <SectionHead eyebrow="โครงการปัจจุบัน" title="WHAT WE'RE WORKING ON." />
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.slice(0, 3).map((p) => (
            <Link key={p.slug} to={p.to} className="group bg-background p-6 md:p-8">
              <ImgBlock className="aspect-[16/10] w-full" />
              <div className="mt-6 flex items-center justify-between">
                <Tag>{p.status}</Tag>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {p.org}
                </span>
              </div>
              <h3 className="display-xl mt-4 text-2xl">{p.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              <span className="mt-6 inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-xs font-semibold uppercase tracking-[0.16em] transition-transform group-hover:translate-x-1">
                {p.cta} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* HOUSES */}
      <Section className="bg-navy-deep text-primary-foreground">
        <div className="mb-10 flex flex-col gap-6 border-t border-primary-foreground/20 pt-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display-xl text-[clamp(1.9rem,5vw,3.6rem)]">
            09 HOUSES.
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
          <HouseGrid month={CURRENT_MONTH} />
        </div>
      </Section>

      {/* EXEC BOARD */}
      <Section>
        <SectionHead eyebrow="คณะกรรมการบริหาร" title="MEET THE EXECUTIVE BOARD" />
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

      {/* MEMBERS */}
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
        />
        <MemberGrid />
      </Section>

      {/* CLUBS */}
      <Section>
        <SectionHead eyebrow="ชมรมตามความสนใจ" title="CLUBS OF INTEREST" />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {CLUBS.map((c) => (
            <Link
              key={c.slug}
              to="/clubs/$slug"
              params={{ slug: c.slug }}
              className={`${c.cls} group bg-background p-6 transition-colors hover:bg-[var(--house)] md:p-8`}
            >
              <div className="flex items-baseline justify-between">
                <span className="num text-4xl text-muted-foreground transition-colors group-hover:text-white/70">
                  {String(CLUBS.indexOf(c) + 1).padStart(2, "0")}
                </span>
                <span className="h-8 w-8 bg-[var(--house)] transition-colors group-hover:bg-white/80" />
              </div>
              <h3 className="display-xl mt-10 text-2xl transition-colors group-hover:text-white">{c.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground transition-colors group-hover:text-white/80">
                {c.nameTh} · {c.tagline}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {/* NEWS */}
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
          {NEWS.slice(0, 3).map((n) => (
            <Link key={n.slug} to="/news/$slug" params={{ slug: n.slug }} className="group">
              <ImgBlock className="aspect-[4/3] w-full" />
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
