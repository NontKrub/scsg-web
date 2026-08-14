import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Tag } from "@/components/site/primitives";


export const Route = createFileRoute("/news/$slug")({
  head: () => ({
    meta: [
      { title: "ข่าวสภานักเรียน — SGSC News" },
      { name: "description", content: "ข่าวสารและประกาศจากสภานักเรียนโรงเรียนเซนต์คาเบรียล" },
      { property: "og:title", content: "SGSC News" },
      { property: "og:description", content: "ข่าวสารและประกาศจากสภานักเรียน" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: NewsArticle,
});

function NewsArticle() {
  const c = useContent();
  const { slug } = Route.useParams();
  const n = c.news.find((x) => x.slug === slug);
  if (!n) return <NotFoundBlock label="ไม่พบข่าวนี้" />;
  const more = c.news.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <>
      <Section className="pb-10">
        <Link to="/news" className="num text-xs uppercase tracking-[0.2em] text-muted-foreground">
          ← ข่าวทั้งหมด
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <Tag>{n.cat}</Tag>
          <span className="text-xs text-muted-foreground">{n.date}</span>
        </div>
        <h1 className="display-xl mt-6 max-w-4xl text-[clamp(2rem,6vw,4rem)] leading-tight">{n.title}</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{n.intro}</p>
      </Section>

      <Section className="pt-0">
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <article className="max-w-2xl">
            {n.body.map((p, i) => (
              <p key={i} className="mb-6 leading-relaxed">
                {p}
              </p>
            ))}
          </article>
          <aside className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="eyebrow">เกี่ยวข้องกับ</p>
            <p className="mt-3 text-sm font-semibold">{n.related}</p>
            <p className="eyebrow mt-8">หมวดหมู่</p>
            <p className="num mt-3 text-sm">{n.cat}</p>
            <p className="eyebrow mt-8">เผยแพร่</p>
            <p className="num mt-3 text-sm">{n.date}</p>
          </aside>
        </div>
      </Section>

      <Section className="bg-secondary">
        <p className="eyebrow mb-8">ข่าวอื่น</p>
        <div className="grid gap-8 md:grid-cols-3">
          {more.map((m) => (
            <Link key={m.slug} to="/news/$slug" params={{ slug: m.slug }} className="group">
              <p className="mt-4 text-xs text-muted-foreground">{m.date}</p>
              <h3 className="mt-2 font-semibold leading-snug group-hover:opacity-60">{m.title}</h3>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

function NotFoundBlock({ label }: { label: string }) {
  return (
    <Section>
      <h1 className="display-xl text-3xl">{label}</h1>
      <p className="mt-4 text-sm text-muted-foreground">ข่าวนี้อาจถูกลบหรือยังไม่ได้เผยแพร่</p>
    </Section>
  );
}
