import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

function safeNext(next: unknown): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s["next"]) }),
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ | SGSC สภานักเรียนเซนต์คาเบรียล" },
      {
        name: "description",
        content: "เข้าสู่ระบบเพื่อเชื่อมต่อผู้ช่วย AI กับข้อมูลของสภานักเรียนโรงเรียนเซนต์คาเบรียล",
      },
      { property: "og:title", content: "เข้าสู่ระบบ | SGSC" },
      { property: "og:description", content: "เข้าสู่ระบบสำหรับสมาชิกสภานักเรียน SGSC" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(next);
    });
  }, [next]);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      window.location.replace(next);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) window.location.replace(next);
    else toast.success("สร้างบัญชีแล้ว — กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary px-5">
      <form onSubmit={submit} className="w-full max-w-sm border border-border bg-background p-8">
        <p className="eyebrow">SGSC</p>
        <h1 className="display-xl mt-3 text-2xl">เข้าสู่ระบบ</h1>
        <p className="mt-3 text-xs text-muted-foreground">
          บัญชีนี้ใช้สำหรับเชื่อมต่อผู้ช่วย AI (MCP) กับข้อมูลสภานักเรียน
        </p>
        <label className="mt-8 block text-xs font-semibold uppercase tracking-[0.16em]">
          อีเมล
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm"
        />
        <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em]">
          รหัสผ่าน
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm"
        />
        <button
          disabled={busy}
          className="mt-8 w-full bg-primary px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
        >
          {mode === "in" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-4 w-full text-xs text-muted-foreground underline"
        >
          {mode === "in" ? "ยังไม่มีบัญชี? สร้างบัญชีใหม่" : "มีบัญชีแล้ว เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
}
