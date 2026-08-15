import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HouseCompare, MonthPicker, ScoreTable } from "@/components/site/ScoreBoard";
import { Section, SectionHead, Tag } from "@/components/site/primitives";
import { MONTHS, MONTH_TH, TIERS, type Month } from "@/data/sgsc";

export const Route = createFileRoute("/competition")({
  head: () => ({
    meta: [
      { title: "House Competition — คะแนนบ้านสายกีฬา SGSC" },
      { name: "description", content: "ตารางคะแนน House Competition ทั้ง 9 บ้าน รายเดือน ระดับคะแนน และรางวัลประจำเดือน" },
      { property: "og:title", content: "HOUSE COMPETITION — SGSC" },
      { property: "og:description", content: "คะแนน อันดับ และรางวัลประจำเดือนของทั้ง 9 บ้าน" },
    ],
  }),
  component: Competition,
});

function Competition() {
  const c = useContent();
  const [month, setMonth] = useState<Month>(c.currentMonth);
  const honors = honorsOf(c, month);
  const hom = c.houses.find((h) => h.slug === honors.houseOfMonth);
  const cex = c.houses.find((h) => h.slug === honors.character);
  const improved = [...c.houses].sort((a, b) => growth(c, b.slug, month) - growth(c, a.slug, month))[0];


  return (
    <>
      <Section className="pb-8">
        <Tag>House of Saints</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,6.5rem)]">HOUSE COMPETITION</h1>
        <p className="mt-6 text-muted-foreground">
          ผลคะแนนประจำเดือน{MONTH_TH[month]} 2026 · เลือกเดือนเพื่อดูผลย้อนหลัง
        </p>
        <div className="mt-8">
          <MonthPicker value={month} onChange={setMonth} />
        </div>
      </Section>

      <Section className="pt-4">
        <ScoreTable month={month} />
      </Section>

      <Section className="bg-navy-deep text-primary-foreground">
        <div className="mb-10 border-t border-primary-foreground/20 pt-6">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-primary-foreground/50">
            รางวัลประจำเดือน{MONTH_TH[month]}
          </p>
          <h2 className="display-xl mt-4 text-[clamp(1.8rem,5vw,3.2rem)]">MONTHLY HONORS</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { house: hom, title: "HOUSE OF THE MONTH", th: "บ้านประจำเดือน" },
            { house: cex, title: "HOUSE EXCELLENCE AWARDS", th: "รางวัลบ้านยอดเยี่ยม" },
          ]
            .filter((a): a is { house: NonNullable<typeof a.house>; title: string; th: string } => !!a.house)
            .map((a) => (
              <div
                key={a.title}
                className={`${a.house.cls} relative overflow-hidden border px-8 py-10`}
                style={{
                  borderColor: "var(--house)",
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--house) 32%, transparent), transparent 70%)",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[var(--house)]" />
                <div className="flex items-center gap-6">
                  <img src={a.house.emblem} alt="" className="h-24 w-24 object-contain md:h-32 md:w-32" />
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-primary-foreground">
                      {a.title}
                    </p>
                    <h3 className="display-xl mt-3 text-2xl md:text-3xl">{a.house.name}</h3>
                    <p className="mt-2 text-sm text-primary-foreground/70">
                      {a.th} · {MONTH_TH[month]} 2026 · {a.house.scores[month].toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="อันดับการพัฒนา" title="IMPROVEMENT LEADERBOARD" sub={`เทียบกับเดือนก่อนหน้า`} />
        <div className="border-t border-border">
          {board.map((b, i) => (
            <div
              key={b.house.slug}
              className={`${b.house.cls} grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border py-4 md:gap-8`}
            >
              <span className="num w-12 text-2xl text-muted-foreground md:w-16 md:text-3xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 items-center gap-4">
                <span className="h-8 w-1.5 shrink-0 bg-[var(--house)]" />
                <img src={b.house.emblem} alt="" className="hidden h-10 w-10 object-contain sm:block" />
                <span className="num truncate text-base md:text-xl">{b.house.name}</span>
              </span>
              <span className={`num text-right text-xl md:text-2xl ${b.g >= 0 ? "text-primary" : "text-muted-foreground"}`}>
                {b.g >= 0 ? "+" : ""}
                {b.g.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="ระดับคะแนน" title="HOUSE PERFORMANCE LEVEL" />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
          {TIERS.map((t, i) => {
            const inTier = ranking(c, month).filter((r) => tierOf(r.score).name === t.name);
            return (
              <div key={t.name} className="bg-background p-6">
                <div className="num text-2xl">
                  {t.min === 0 ? "< 80" : `${t.min}–${i === 0 ? 100 : t.min + 4}`}%
                </div>
                <p className="num mt-4 text-sm">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.th}</p>
                <div className="mt-4 space-y-1 border-t border-border pt-4">
                  {inTier.length === 0 ? (
                    <p className="text-xs text-muted-foreground">ยังไม่มีบ้านในระดับนี้</p>
                  ) : (
                    inTier.map((r) => (
                      <p key={r.house.slug} className={`${r.house.cls} flex items-center gap-2 text-xs`}>
                        <span className="h-3 w-1 shrink-0 bg-[var(--house)]" />
                        <span className="num truncate">{r.house.name}</span>
                        <span className="num ml-auto text-muted-foreground">{r.score.toFixed(2)}</span>
                      </p>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>


      <Section className="bg-secondary">
        <SectionHead
          eyebrow="การเติบโต"
          title="HOUSE GROWTH"
          sub="เลือกบ้านเพื่อเปรียบเทียบคะแนนรายเดือน"
          right={
            improved ? (
              <div className="border border-border bg-background p-6">
                <p className="eyebrow">Most improved house</p>
                <p className="num mt-3 text-2xl">{improved.name}</p>
                <p className="num mt-1 text-3xl text-primary">
                  +{growth(c, improved.slug, month).toFixed(1)}%
                </p>
              </div>
            ) : undefined
          }

        />
        <HouseCompare />
        <div className="mt-12 grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:grid-cols-7">
          {MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className="bg-background p-5 text-left transition-colors hover:bg-secondary"
            >
              <p className="num text-sm">{m}</p>
              <p className="mt-2 text-xs text-muted-foreground">{MONTH_TH[m]}</p>
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}
