import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { SGSC_LOGO } from "@/data/sgsc";

const COLS = [
  {
    head: "องค์กร",
    links: [
      { to: "/about", label: "เกี่ยวกับ SGSC" },
      { to: "/members", label: "สมาชิกสภา" },
      { to: "/student-government", label: "สโมสรนักเรียน" },
      { to: "/members", label: "ผู้แทนห้องเรียน" },
      { to: "/complaints", label: "ส่งเรื่องร้องเรียน" },
    ],
  },
  {
    head: "บ้านและชุมนุม",
    links: [
      { to: "/houses", label: "House of Saints" },
      { to: "/competition", label: "House Competition" },
      { to: "/clubs", label: "Clubs of Interest" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-deep text-primary-foreground">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr_repeat(2,1fr)]">

          <div>
            <img src={SGSC_LOGO} alt="ตราสัญลักษณ์ SGSC" className="h-14 w-14 object-contain" />
            <p className="num mt-5 text-2xl">S.C.S.G. / SGSC</p>
            <p className="mt-2 text-sm text-primary-foreground/70">
              สภานักเรียนโรงเรียนเซนต์คาเบรียล
              <br />
              Student Congress of Saint Gabriel&apos;s College
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="โซเชียลมีเดีย SGSC"
                  className="grid h-10 w-10 place-items-center border border-primary-foreground/20 transition-colors hover:border-primary-foreground/60"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.head}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/50">
                {c.head}
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                {c.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Student Congress of Saint Gabriel&apos;s College</p>
          <p className="tracking-[0.2em] uppercase">Labor Omnia Vincit</p>
          <Link to="/admin" className="tracking-[0.2em] uppercase hover:text-primary-foreground">
            SGSC Control
          </Link>
        </div>
      </div>
    </footer>
  );
}
