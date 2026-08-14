import { Link } from "@tanstack/react-router";
import { HOUSES, MONTHS, ranking, tierOf, growth, type Month } from "@/data/sgsc";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ScoreTable({ month, limit }: { month: Month; limit?: number }) {
  const rows = ranking(month).slice(0, limit);
  return (
    <div>
      {rows.map((r) => {
        const tier = tierOf(r.score);
        const g = growth(r.house.slug, month);
        return (
          <Link
            key={r.house.slug}
            to="/houses/$slug"
            params={{ slug: r.house.slug }}
            className={cn(
              r.house.cls,
              "group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-border py-5 transition-colors last:border-b hover:bg-secondary md:gap-8",
            )}
          >
            <span className="num w-14 text-3xl text-muted-foreground md:w-20 md:text-4xl">
              {String(r.rank).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 items-center gap-4">
              <span className="h-9 w-1.5 shrink-0 bg-[var(--house)]" />
              <img src={r.house.emblem} alt="" className="hidden h-12 w-12 object-contain sm:block" />
              <span className="min-w-0">
                <span className="num block truncate text-lg md:text-2xl">{r.house.name}</span>
                <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {tier.name}
                </span>
              </span>
            </span>
            <span className="text-right">
              <span className="num block text-2xl md:text-3xl">{r.score.toFixed(1)}%</span>
              <span className="block text-xs text-muted-foreground">
                {g >= 0 ? "+" : ""}
                {g.toFixed(1)}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function MonthPicker({ value, onChange }: { value: Month; onChange: (m: Month) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {MONTHS.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "num border px-4 py-2 text-xs transition-colors",
            m === value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

const CHART_COLORS = [
  "#E0B100",
  "#C62828",
  "#2E7D4F",
  "#26346B",
  "#D46A9B",
  "#6A3FA0",
  "#E07B2A",
  "#7A5C3C",
  "#8A8A8A",
];

export function GrowthChart({ slugs, height = 340 }: { slugs: string[]; height?: number }) {
  const data = MONTHS.map((m) => {
    const row: Record<string, string | number> = { month: m };
    slugs.forEach((s) => {
      const h = HOUSES.find((x) => x.slug === s);
      if (h) row[h.name] = h.scores[m];
    });
    return row;
  });

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[75, 100]}
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
            }}
          />
          {slugs.map((s) => {
            const h = HOUSES.find((x) => x.slug === s)!;
            const idx = HOUSES.indexOf(h);
            return (
              <Line
                key={s}
                type="monotone"
                dataKey={h.name}
                stroke={CHART_COLORS[idx]}
                strokeWidth={2.5}
                dot={false}
                animationDuration={900}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HouseCompare() {
  const [selected, setSelected] = useState<string[]>(["st-martin", "st-edmund", "st-francis"]);
  const toggle = (slug: string) =>
    setSelected((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <div className="flex flex-wrap gap-2 lg:flex-col">
        {HOUSES.map((h, i) => (
          <button
            key={h.slug}
            onClick={() => toggle(h.slug)}
            className={cn(
              "flex items-center gap-3 border px-3 py-2 text-left text-xs font-semibold transition-colors",
              selected.includes(h.slug)
                ? "border-primary bg-secondary"
                : "border-border text-muted-foreground hover:border-primary",
            )}
          >
            <span className="h-3 w-3 shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
            <span className="num">{h.name}</span>
          </button>
        ))}
      </div>
      <GrowthChart slugs={selected} height={420} />
    </div>
  );
}
