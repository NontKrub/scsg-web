import { useContent } from "@/lib/content";
import { useState } from "react";
import { ORG_FILTERS, type Member } from "@/data/sgsc";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FilterBar } from "./primitives";

type Key = (typeof ORG_FILTERS)[number]["key"];

export function MemberGrid({
  initial = "ALL" as Key,
  showClass = true,
  lock = false,
}: {
  initial?: Key;
  showClass?: boolean;
  lock?: boolean;
}) {
  const c = useContent();
  const [filter, setFilter] = useState<Key>(initial);
  const list = c.members.filter((m) => filter === "ALL" || m.org === filter);
  const [open, setOpen] = useState<Member | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {lock ? (
          <p className="eyebrow">{ORG_FILTERS.find((o) => o.key === filter)?.label}</p>
        ) : (
          <FilterBar options={ORG_FILTERS} value={filter} onChange={setFilter} />
        )}
        <p className="num text-sm text-muted-foreground">
          {String(list.length).padStart(2, "0")} คน
        </p>
      </div>

      <div className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <button
            key={m.id}
            onClick={() => setOpen(m)}
            className="flex items-baseline justify-between gap-4 bg-background px-5 py-4 text-left transition-colors hover:bg-secondary"
          >
            <span className="text-sm font-semibold leading-tight">{m.name || "—"}</span>
            <span className="num shrink-0 text-xs text-muted-foreground">
              {showClass ? m.klass : m.orgLabel}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <div>
              {open.photoUrl && (
                <img
                  src={open.photoUrl}
                  alt={open.name}
                  loading="lazy"
                  className="mb-5 aspect-[3/4] w-32 border border-border object-cover"
                />
              )}
              <p className="eyebrow">{open.orgLabel}</p>
              <h3 className="display-xl mt-3 text-2xl">{open.name || "—"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {open.role} · {open.klass}
              </p>
              {open.duties && (
                <p className="mt-5 border-t border-border pt-5 text-sm leading-relaxed">
                  {open.duties}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
