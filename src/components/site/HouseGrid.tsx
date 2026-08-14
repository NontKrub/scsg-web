import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { Link } from "@tanstack/react-router";
import { tierOf, type Month } from "@/data/sgsc";
import { cn } from "@/lib/utils";

export function HouseGrid({ month, big = false }: { month: Month; big?: boolean }) {
  const c = useContent();
  return (
    <div className={cn("grid gap-px bg-border", big ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3 lg:grid-cols-3")}>
      {c.houses.map((h) => {
        const score = h.scores[month];
        const tier = tierOf(score);
        return (
          <Link
            key={h.slug}
            to="/houses/$slug"
            params={{ slug: h.slug }}
            className={cn(
              h.cls,
              "group relative flex flex-col justify-between bg-background p-6 transition-colors duration-300 hover:bg-[var(--house)] md:p-8",
            )}
          >
            <div className="flex items-start justify-between">
              <span className="num text-sm text-muted-foreground transition-colors group-hover:text-white/70">
                {h.no} / 09
              </span>
              <span className="num text-sm text-muted-foreground transition-colors group-hover:text-white/70">
                RANK {String(rankOf(c, h.slug, month)).padStart(2, "0")}
              </span>
            </div>

            <div className="my-6 grid place-items-center">
              <img
                src={h.emblem}
                alt={`ตราบ้าน ${h.nameTh}`}
                className={cn(
                  "object-contain transition-transform duration-500 group-hover:scale-105",
                  big ? "h-40 md:h-48" : "h-28 md:h-32",
                )}
              />
            </div>

            <div>
              <h3
                className={cn(
                  "display-xl transition-colors group-hover:text-white",
                  big ? "text-2xl md:text-3xl" : "text-xl",
                )}
              >
                {h.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground transition-colors group-hover:text-white/80">
                {h.nameTh} · สี{h.colorLabel}
              </p>
              <div className="mt-4 flex items-end justify-between border-t border-border pt-3 transition-colors group-hover:border-white/30">
                <span className="num text-3xl transition-colors group-hover:text-white">{score.toFixed(1)}%</span>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-white/80">
                  {tier.name}
                </span>
              </div>
              <span className="mt-4 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-white">
                ดูบ้านนี้ →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
