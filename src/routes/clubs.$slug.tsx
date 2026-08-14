import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ImgBlock, Section, SectionHead, Tag } from "@/components/site/primitives";


export const Route = createFileRoute("/clubs/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — ชุมนุม | SGSC` },
      { name: "description", content: "กิจกรรม สมาชิก และผลงานของชุมนุมตามความสนใจ สภานักเรียนโรงเรียนเซนต์คาเบรียล" },
      { property: "og:title", content: "Clubs of Interest — SGSC" },
      { property: "og:description", content: "กิจกรรมและผลงานของชุมนุม" },
    ],
  }),
  component: ClubPage,
});

function ClubPage() {
  const c = useContent();
  const { slug } = Route.useParams();
  const club = c.clubs.find((x) => x.slug === slug);
  if (!club) return <NotFoundBlock label="ไม่พบชุมนุมนี้" />;
  const staff = c.members.filter((m) => m.org === "CLUB" && m.orgLabel === club.name);

  return (
    <div className={club.cls}>
      <section className="border-b border-border bg-[var(--house-ink)] px-5 py-16 text-white md:px-10 md:py-24">
        <div className="mx-auto w-full max-w-[1400px]">
          <p className="num text-sm text-white/70">CLUB · {club.nameTh}</p>
          <h1 className="display-xl mt-4 text-[clamp(2.4rem,8vw,5.6rem)]">{club.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">{club.tagline}</p>
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/25 pt-6 sm:grid-cols-3">
            <div>
              <div className="num text-3xl">{club.members}</div>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/60">สมาชิก</p>
            </div>
            <div>
              <div className="num text-lg">{club.head}</div>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/60">หัวหน้าชุมนุม</p>
            </div>
            <div>
              <div className="num text-3xl">{club.activities.length}</div>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/60">กิจกรรมหลัก</p>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Tag>เกี่ยวกับชุมนุม</Tag>
            <h2 className="display-xl mt-5 text-[clamp(1.7rem,4.5vw,2.6rem)]">ABOUT THE CLUB</h2>
            <p className="mt-6 leading-relaxed">{club.about}</p>
            <ul className="mt-8">
              {club.activities.map((a) => (
                <li key={a} className="flex items-center gap-4 border-t border-border py-4 last:border-b">
                  <span className="h-2 w-2 bg-[var(--house)]" />
                  <span className="text-sm">{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <ImgBlock className="aspect-[4/3] w-full" />
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="คณะกรรมการชุมนุม" title="CLUB COMMITTEE" />
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {staff.map((m) => (
            <div key={m.id} className="bg-background p-4">
              <ImgBlock className="aspect-[3/4] w-full" />
              <p className="mt-4 text-sm font-semibold">{m.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.role}</p>
              <p className="num mt-1 text-xs text-muted-foreground">{m.klass}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div>
          <Link
            to="/clubs"
            className="inline-flex border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            ชุมนุมทั้งหมด
          </Link>
        </div>
      </Section>
    </div>
  );
}

function NotFoundBlock({ label }: { label: string }) {
  return (
    <Section>
      <h1 className="display-xl text-3xl">{label}</h1>
      <p className="mt-4 text-sm text-muted-foreground">ข้อมูลนี้อาจถูกลบหรือยังไม่ได้เผยแพร่</p>
    </Section>
  );
}
