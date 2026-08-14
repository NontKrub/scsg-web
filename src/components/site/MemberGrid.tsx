import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { useState } from "react";
import { ORG_FILTERS, type Member } from "@/data/sgsc";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FilterBar, ImgBlock } from "./primitives";

type Key = (typeof ORG_FILTERS)[number]["key"];

export function MemberGrid({ initial = "ALL" as Key, showClass = true }: { initial?: Key; showClass?: boolean }) {
  const c = useContent();
  const [filter, setFilter] = useState<Key>(initial);
  const [open, setOpen] = useState<Member | null>(null);
  const list = c.members.filter((m) => filter === "ALL" || m.org === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterBar options={ORG_FILTERS} value={filter} onChange={setFilter} />
        <p className="num text-sm text-muted-foreground">{String(list.length).padStart(2, "0")} คน</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-5">
        {list.map((m) => (
          <button
            key={m.id}
            onClick={() => setOpen(m)}
            className="group bg-background p-3 text-left transition-colors hover:bg-secondary"
          >
            <ImgBlock className="aspect-[3/4] w-full">
              <span className="num text-2xl text-muted-foreground/40">{m.name.charAt(0)}</span>
            </ImgBlock>
            <p className="mt-3 text-sm font-semibold leading-tight">{m.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.role}</p>
            <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {m.orgLabel}
              {showClass && ` · ${m.klass}`}
            </p>
          </button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-3xl gap-0 p-0">
          {open && (
            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <ImgBlock className="aspect-[3/4] w-full">
                <span className="num text-6xl text-muted-foreground/40">{open.name.charAt(0)}</span>
              </ImgBlock>
              <div className="p-8">
                <p className="eyebrow">{open.orgLabel}</p>
                <h3 className="display-xl mt-3 text-3xl">{open.name}</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  {open.role} · {open.klass}
                </p>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="eyebrow mb-2">หน้าที่รับผิดชอบ</p>
                  <p className="text-sm leading-relaxed">{open.duties}</p>
                </div>
                {open.projects.length > 0 && (
                  <div className="mt-6 border-t border-border pt-5">
                    <p className="eyebrow mb-2">โครงการที่เกี่ยวข้อง</p>
                    <ul className="space-y-1 text-sm">
                      {open.projects.map((p) => (
                        <li key={p} className="num">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
