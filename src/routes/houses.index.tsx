import { createFileRoute } from "@tanstack/react-router";
import { HouseGrid } from "@/components/site/HouseGrid";
import { Section, Tag } from "@/components/site/primitives";
import { CURRENT_MONTH, MONTH_TH, TIERS } from "@/data/sgsc";

export const Route = createFileRoute("/houses/")({
  head: () => ({
    meta: [
      { title: "House of Saints — 9 บ้านสายกีฬา SGSC" },
      { name: "description", content: "9 บ้านสายกีฬาของโรงเรียนเซนต์คาเบรียล คะแนน อันดับ และระดับของแต่ละบ้าน" },
      { property: "og:title", content: "House of Saints — 9 Houses. One Saint Gabriel's." },
      { property: "og:description", content: "ตราบ้าน คะแนน อันดับ และระดับของทั้ง 9 บ้าน" },
    ],
  }),
  component: HousesLanding,
});

function HousesLanding() {
  return (
    <>
      <Section className="pb-10">
        <Tag>House of Saints</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,7rem)]">HOUSE OF SAINTS</h1>
        <p className="mt-6 text-lg text-muted-foreground">9 บ้าน หนึ่งเซนต์คาเบรียล</p>
        <p className="eyebrow mt-10">คะแนนประจำเดือน{MONTH_TH[CURRENT_MONTH]} 2026</p>
      </Section>

      <Section className="pt-0">
        <div className="border-t border-border">
          <HouseGrid month={CURRENT_MONTH} big />
        </div>
      </Section>

      <Section className="bg-secondary">
        <p className="eyebrow">ระดับคะแนน</p>
        <h2 className="display-xl mt-4 text-[clamp(1.8rem,5vw,3.2rem)]">HOUSE SCORE TIERS</h2>
        <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
          {TIERS.map((t, i) => (
            <div key={t.name} className="bg-background p-6">
              <div className="num text-2xl">
                {t.min === 0 ? "< 80" : `${t.min}–${i === 0 ? 100 : t.min + 4}`}%
              </div>
              <p className="num mt-4 text-sm">{t.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.th}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
