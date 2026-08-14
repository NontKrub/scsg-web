import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ImgBlock, Section, Tag } from "@/components/site/primitives";
import { NEWS } from "@/data/sgsc";

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => {
    const n = NEWS.find((x) => x.slug === params.slug);
    if (!n) throw notFound();
    return { slug: n.slug, title: n.title, intro: n.intro };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "ไม่พบข่าวนี้ — SGSC" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — SGSC News` },
        { name: "description", content: loaderData.intro },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.intro },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: NewsArticle,
});

function NewsArticle() {
  const { slug } = Route.useLoaderData();
  const n = NEWS.find((x) => x.slug === slug)!;
  const more = NEWS.filter((x) => x.slug !== slug).slice(0, 3);

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
        <ImgBlock className="aspect-[16/9] w-full" />
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
              <ImgBlock className="aspect-[4/3] w-full" />
              <p className="mt-4 text-xs text-muted-foreground">{m.date}</p>
              <h3 className="mt-2 font-semibold leading-snug group-hover:opacity-60">{m.title}</h3>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
