import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { SGSC_LOGO } from "@/data/sgsc";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/about", label: "SGSC" },
  { to: "/members", label: "สมาชิกสภา" },
  { to: "/houses", label: "บ้านสายกีฬา" },
  { to: "/clubs", label: "ชุมนุม" },
  { to: "/student-government", label: "สโมสรนักเรียน" },
  { to: "/competition", label: "คะแนนบ้าน" },
  { to: "/news", label: "ข่าว" },
];


export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-6 px-5 md:h-20 md:px-10">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={SGSC_LOGO} alt="ตราสัญลักษณ์ SGSC" className="h-9 w-9 object-contain md:h-11 md:w-11" />
          <span className="leading-none">
            <span className="num block text-base md:text-lg">SGSC</span>
            <span className="hidden text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase md:block">
              Student Congress
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "px-3 py-2 text-[0.78rem] font-semibold tracking-wide transition-colors",
                path.startsWith(n.to) ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 xl:ml-0">
          <button
            aria-label="ค้นหา"
            onClick={() => setQ((v) => !v)}
            className="grid h-10 w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            aria-label="เมนู"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center text-foreground xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {q && (
        <div className="border-t border-border px-5 py-3 md:px-10">
          <input
            autoFocus
            placeholder="ค้นหาบ้าน ชุมนุม สมาชิก หรือข่าว…"
            className="mx-auto block w-full max-w-[1400px] bg-transparent py-2 text-lg outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      {open && (
        <nav className="border-t border-border bg-background px-5 pb-6 xl:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border py-4 text-lg font-semibold"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
