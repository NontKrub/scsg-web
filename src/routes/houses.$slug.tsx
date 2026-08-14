import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GrowthChart } from "@/components/site/ScoreBoard";
import { ImgBlock, Section, SectionHead, Tag } from "@/components/site/primitives";
import {
  CURRENT_MONTH,
  HOUSES,
  MEMBERS,
  MONTHS,
  MONTH_TH,
  NEWS,
  growth,
  rankOf,
  tierOf,
} from "@/data/sgsc";

export const Route = createFileRoute("/houses/$slug")({
  loader: ({ params }) => {
    const house = HOUSES.find((h) => h.slug === params.slug);
    if (!house) throw notFound();
    return { slug: house.slug, name: house.name, nameTh: house.nameTh };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "ไม่พบบ้านนี้ — SGSC" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.name} — บ้าน${loaderData.nameTh} | SGSC` },
        {
          name: "description",
          content: `คะแนน อันดับ คณะกรรมการ และข่าวของบ้าน${loaderData.nameTh} ในการแข่งขัน House Competition`,
        },
        { property: "og:title", content: `${loaderData.name} — House of Saints` },
        { property: "og:description", content: `คะแนน อันดับ และข่าวของบ้าน${loaderData.nameTh}` },
      ],
    };
  },
  component: HousePage,
});

function HousePage() {
  const { slug } = Route.useLoaderData();
  const house = HOUSES.find((h) => h.slug === slug)!;
  const score = house.scores[CURRENT_MONTH];
  const tier = tierOf(score);
  const rank = rankOf(slug, CURRENT_MONTH);
  const g = growth(slug, CURRENT_MONTH);
  const committee = MEMBERS.filter((m) => m.org === "HOUSE" && m.orgLabel === house.name);
  const news = NEWS.filter((n) => n.houseSlug === slug);

  return (
    <div className={house.cls}>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-[var(--house-ink)] text-white">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, white 0 2px, transparent 2px 22px)",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rise">
            <p className="num text-sm text-white/70">HOUSE {house.no} / 09</p>
            <h1 className="display-xl mt-4 text-[clamp(2.6rem,9vw,6.5rem)]">{house.name}</h1>
            <p className="mt-3 text-lg text-white/80">
              บ้าน{house.nameTh} · สี{house.colorLabel}
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/25 pt-6">
              <div>
                <div className="num text-[clamp(2rem,5vw,3.4rem)] leading-none">{score.toFixed(1)}%</div>
                <p className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/60">คะแนนปัจจุบัน</p>
              </div>
              <div>
                <div className="num text-lg leading-tight md:text-2xl">{tier.name}</div>
                <p className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/60">ระดับ</p>
              </div>
              <div>
                <div className="num text-[clamp(2rem,5vw,3.4rem)] leading-none">
                  {String(rank).padStart(2, "0")}/09
                </div>
                <p className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/60">อันดับ</p>
              </div>
            </div>
          </div>
          <div className="grid place-items-center">
            <img
              src={house.emblem}
              alt={`ตราบ้าน${house.nameTh}`}
              className="h-[280px] object-contain drop-shadow-xl md:h-[420px]"
            />
          </div>
        </div>
      </section>

      {/* BASIC INFO */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <Tag>เกี่ยวกับบ้าน</Tag>
            <h2 className="display-xl mt-5 text-[clamp(1.7rem,4.5vw,2.8rem)]">HOUSE IDENTITY</h2>
            <p className="mt-6 text-base leading-relaxed">{house.intro}</p>
            <p className="mt-3 text-sm text-muted-foreground">{house.personality}</p>
            <div className="mt-8 flex items-center gap-4">
              <span className="h-14 w-14 bg-[var(--house)]" />
              <div>
                <p className="num text-sm">สี{house.colorLabel}</p>
                <p className="text-xs text-muted-foreground">สีประจำบ้าน</p>
              </div>
            </div>
          </div>
          <ImgBlock className="aspect-[4/3] w-full" />
        </div>
      </Section>

      {/* COMMITTEE */}
      <Section className="bg-secondary">
        <SectionHead eyebrow="คณะกรรมการบ้าน" title="HOUSE COMMITTEE" />
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
          {committee.map((m) => (
            <div key={m.id} className="bg-background p-4">
              <ImgBlock className="aspect-[3/4] w-full" />
              <p className="mt-4 text-sm font-semibold">{m.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.role}</p>
              <p className="num mt-1 text-xs text-muted-foreground">{m.klass}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SCORE + GRAPH */}
      <Section>
        <SectionHead eyebrow={`ประจำเดือน${MONTH_TH[CURRENT_MONTH]} 2026`} title="HOUSE SCORE" />
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="grid grid-cols-2 gap-px bg-border">
              {[
                { v: `${score.toFixed(1)}%`, l: "คะแนน" },
                { v: `${String(rank).padStart(2, "0")}/09`, l: "อันดับ" },
                { v: tier.name, l: "ระดับ" },
                { v: `${g >= 0 ? "+" : ""}${g.toFixed(1)}`, l: "เทียบเดือนก่อน" },
              ].map((x) => (
                <div key={x.l} className="bg-background p-5">
                  <div className="num text-xl leading-tight md:text-2xl">{x.v}</div>
                  <p className="eyebrow mt-2">{x.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <p className="eyebrow mb-3">ประวัติคะแนนรายเดือน</p>
              {MONTHS.map((m) => (
                <div key={m} className="flex items-center gap-4 border-t border-border py-2.5 last:border-b">
                  <span className="num w-12 text-xs text-muted-foreground">{m}</span>
                  <span className="h-2 flex-1 bg-block">
                    <span
                      className="block h-2 bg-[var(--house)]"
                      style={{ width: `${((house.scores[m] - 70) / 30) * 100}%` }}
                    />
                  </span>
                  <span className="num w-16 text-right text-sm">{house.scores[m].toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow mb-4">HOUSE GROWTH</p>
            <GrowthChart slugs={[slug]} height={420} />
          </div>
        </div>
      </Section>

      {/* NEWS */}
      <Section className="bg-secondary">
        <SectionHead eyebrow="ข่าวของบ้าน" title="HOUSE NEWS" />
        <div className="grid gap-8 md:grid-cols-3">
          {(news.length ? news : NEWS.filter((n) => n.cat === "HOUSE")).slice(0, 3).map((n) => (
            <Link key={n.slug} to="/news/$slug" params={{ slug: n.slug }} className="group">
              <ImgBlock className="aspect-[4/3] w-full" />
              <div className="mt-4 flex items-center gap-3">
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

      {/* ACHIEVEMENTS */}
      <Section>
        <SectionHead eyebrow="รางวัลและความสำเร็จ" title="HOUSE ACHIEVEMENTS" />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "HOUSE OF THE MONTH", s: "กรกฎาคม 2026" },
            { t: "CHARACTER EXCELLENCE", s: "มิถุนายน 2026" },
            { t: "SPORTS DAY CHAMPION", s: "กรกฎาคม 2026" },
            { t: "BEST HOUSE PROJECT", s: "สิงหาคม 2026" },
          ].map((a) => (
            <div key={a.t} className="bg-background p-6">
              <span className="block h-1 w-10 bg-[var(--house)]" />
              <p className="num mt-6 text-sm leading-tight">{a.t}</p>
              <p className="mt-2 text-xs text-muted-foreground">{a.s}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/competition"
            className="inline-flex bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground"
          >
            ดู House Competition
          </Link>
          <Link
            to="/houses"
            className="inline-flex border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            บ้านทั้งหมด
          </Link>
        </div>
      </Section>
    </div>
  );
}
