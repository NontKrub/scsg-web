import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FilterBar, ImgBlock, Section, Tag } from "@/components/site/primitives";
import { NEWS } from "@/data/sgsc";

const CATS = [
  { key: "ALL", label: "ทั้งหมด" },
  { key: "SGSC", label: "SGSC" },
  { key: "STUDENT GOVERNMENT", label: "สโมสรนักเรียน" },
  { key: "HOUSE", label: "คณะสี" },
  { key: "CLUB", label: "ชุมนุม" },
  { key: "PROJECT", label: "โครงการ" },
] as const;

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "ข่าวและประกาศ — SGSC News" },
      { name: "description", content: "ข่าวสาร ประกาศ และกิจกรรมล่าสุดจากสโมสรนักเรียน บ้านสายกีฬา ชุมนุม และโครงการของ SGSC" },
      { property: "og:title", content: "SGSC NEWS — ข่าวและประกาศ" },
      { property: "og:description", content: "ติดตามข่าวสารและกิจกรรมล่าสุดของ Student Congress of Saint Gabriel's College" },
    ],
  }),
  component: NewsIndex,
});

function NewsIndex() {
  const [cat, setCat] = useState<(typeof CATS)[number]["key"]>("ALL");
  const list = cat === "ALL" ? NEWS : NEWS.filter((n) => n.cat === cat);
  const feature = list[0];

  return (
    <>
      <Section className="pb-8">
        <Tag>ข่าวสาร</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,6.5rem)]">NEWS &amp; UPDATES</h1>
        <div className="mt-10">
          <FilterBar options={CATS} value={cat} onChange={setCat} />
        </div>
      </Section>

      {feature && (
        <Section className="pt-0">
          <Link
            to="/news/$slug"
            params={{ slug: feature.slug }}
            className="group grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <ImgBlock className="aspect-[16/10] w-full" />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <Tag>{feature.cat}</Tag>
                <span className="text-xs text-muted-foreground">{feature.date}</span>
              </div>
              <h2 className="display-xl mt-5 text-[clamp(1.6rem,4vw,2.6rem)] leading-tight transition-opacity group-hover:opacity-60">
                {feature.title}
              </h2>
              <p className="mt-5 text-muted-foreground">{feature.intro}</p>
              <p className="num mt-8 text-xs uppercase tracking-[0.2em]">อ่านต่อ →</p>
            </div>
          </Link>
        </Section>
      )}

      <Section className="pt-0">
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {list.slice(1).map((n) => (
            <Link
              key={n.slug}
              to="/news/$slug"
              params={{ slug: n.slug }}
              className="group bg-background p-6 transition-colors hover:bg-secondary"
            >
              <ImgBlock className="aspect-[4/3] w-full" />
              <div className="mt-5 flex items-center gap-3">
                <Tag>{n.cat}</Tag>
                <span className="text-xs text-muted-foreground">{n.date}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold leading-snug">{n.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{n.intro}</p>
            </Link>
          ))}
        </div>
        {list.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">ยังไม่มีข่าวในหมวดนี้</p>
        )}
      </Section>
    </>
  );
}
