import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ImgBlock({
  className,
  label,
  src,
  alt,
  imgClassName,
  children,
}: {
  className?: string;
  label?: string;
  src?: string;
  alt?: string;
  imgClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn("img-block flex items-center justify-center overflow-hidden", className)}
      aria-hidden={!label && !src}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        children
      )}
    </div>
  );
}

export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("px-5 py-20 md:px-10 md:py-28", className)}>
      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  right,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 border-t border-border pt-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="display-xl text-[clamp(1.9rem,5vw,3.6rem)]">{title}</h2>
        {sub && <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">{sub}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-border pt-4">
      <div className="num text-[clamp(2rem,5vw,3.5rem)] leading-none">{value}</div>
      <div className="eyebrow mt-2">{label}</div>
    </div>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border border-border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FilterBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors",
            value === o.key
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
