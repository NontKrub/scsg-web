import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ORGS, SGSC_LOGO } from "@/data/sgsc";
import { cn } from "@/lib/utils";

export function OrgMap() {
  const [active, setActive] = useState(0);
  const org = ORGS[active]!;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <div className="relative grid place-items-center rounded-lg bg-navy-deep px-6 py-14 text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="h-full w-full [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]" />
        </div>
        <div className="relative flex flex-col items-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <img src={SGSC_LOGO} alt="SGSC" className="h-14 w-14 object-contain" />
          </div>
          <p className="num mt-4 text-xl">SGSC</p>
          <div className="h-10 w-px bg-primary-foreground/25" />
          <div className="grid w-full max-w-lg grid-cols-2 gap-3">
            {ORGS.map((o, i) => (
              <button
                key={o.slug}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  "border p-4 text-left transition-all duration-300",
                  i === active
                    ? "border-gold bg-primary-foreground/10"
                    : "border-primary-foreground/20 hover:border-primary-foreground/50",
                )}
              >
                <span className="num block text-[0.8rem] leading-tight">{o.name}</span>
                <span className="mt-1 block text-[0.7rem] text-primary-foreground/60">{o.nameTh}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <p className="eyebrow">องค์กรที่ {String(active + 1).padStart(2, "0")} / 04</p>
        <h3 className="display-xl mt-4 text-[clamp(1.8rem,4vw,3rem)]">{org.name}</h3>
        <p className="mt-1 text-lg text-muted-foreground">{org.nameTh}</p>
        <p className="mt-6 max-w-md text-base leading-relaxed">{org.desc}</p>
        <div className="mt-8 flex items-end gap-10">
          <div>
            <div className="num text-5xl">{org.count}</div>
            <div className="eyebrow mt-1">สมาชิก</div>
          </div>
          <Link
            to={org.to}
            className="border-b-2 border-primary pb-1 text-sm font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-60"
          >
            ดูองค์กรนี้
          </Link>
        </div>
      </div>
    </div>
  );
}
