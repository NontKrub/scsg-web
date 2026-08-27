import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ImagePlus, Loader2, LogOut, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminDelete, adminList, adminSave, adminSaveScores, checkAdmin } from "@/lib/admin.functions";
import { MONTHS, MONTH_TH, type Month } from "@/data/sgsc";
import { RadioAdminPanel } from "@/components/site/RadioAdminPanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ระบบจัดการเว็บไซต์ — SGSC Admin" },
      { name: "description", content: "ระบบหลังบ้านสำหรับจัดการข้อมูลเว็บไซต์สภานักเรียนโรงเรียนเซนต์คาเบรียล" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "SGSC Admin" },
      { property: "og:description", content: "ระบบหลังบ้านของสภานักเรียนโรงเรียนเซนต์คาเบรียล" },
    ],
  }),
  component: AdminPage,
});

/* ----------------------------- field schema ----------------------------- */

type FieldKind = "text" | "long" | "number" | "bool" | "list" | "select" | "image";
type Field = { key: string; label: string; kind: FieldKind; options?: string[] };

type SectionDef = {
  key: string;
  table: string;
  label: string;
  subtitle: string;
  fields: Field[];
  primary: string;
  canCreate?: boolean;
  canDelete?: boolean;
};

const t = (key: string, label: string): Field => ({ key, label, kind: "text" });
const n = (key: string, label: string): Field => ({ key, label, kind: "number" });
const img = (key: string, label: string): Field => ({ key, label, kind: "image" });

const SECTIONS: SectionDef[] = [
  {
    key: "members",
    table: "members",
    label: "สมาชิกสภา 68 คน",
    subtitle: "ชื่อ ตำแหน่ง ชั้นเรียน หน้าที่ และรูปของสมาชิกทั้ง 68 ที่นั่ง",
    primary: "role",
    fields: [
      t("name", "ชื่อ-นามสกุล"),
      t("role", "ตำแหน่ง"),
      { key: "org", label: "สังกัด", kind: "select", options: ["SG", "HOUSE", "CLUB", "CLASS"] },
      t("org_label", "ชื่อสังกัด"),
      t("klass", "ชั้น/ห้อง"),
      { key: "duties", label: "หน้าที่รับผิดชอบ", kind: "long" },
      img("photo_url", "รูปภาพ"),
      n("sort", "ลำดับ"),

    ],
  },
  {
    key: "congress_board",
    table: "congress_board",
    label: "กรรมการบริหารสภา",
    subtitle: "5 ที่นั่งบริหารของสภานักเรียน",
    primary: "role",
    fields: [
      t("role", "ตำแหน่ง"),
      t("person_name", "ชื่อ-นามสกุล"),
      t("from_org", "มาจากองค์กร"),
      t("klass", "ชั้น/ห้อง"),
      img("photo_url", "รูปภาพ"),
      n("sort", "ลำดับ"),
    ],
  },
  {
    key: "advisory_board",
    table: "advisory_board",
    label: "คณะที่ปรึกษา",
    subtitle: "ครูและผู้บริหารที่ปรึกษาสภานักเรียน",
    primary: "role",
    canCreate: true,
    canDelete: true,
    fields: [
      t("role", "ตำแหน่ง"),
      t("person_name", "ชื่อ-นามสกุล"),
      { key: "description", label: "คำอธิบาย", kind: "long" },
      img("photo_url", "รูปภาพ"),
      n("sort", "ลำดับ"),
    ],
  },
  {
    key: "houses",
    table: "houses",
    label: "บ้านสายกีฬา",
    subtitle: "ข้อมูล 9 บ้าน ชื่อ สี บุคลิก และประธานบ้าน",
    primary: "name",
    fields: [
      t("no", "ลำดับบ้าน"),
      t("name", "ชื่ออังกฤษ"),
      t("name_th", "ชื่อไทย"),
      t("color_label", "สีประจำบ้าน"),
      t("personality", "บุคลิกประจำบ้าน"),
      { key: "intro", label: "เกี่ยวกับบ้าน", kind: "long" },
      t("captain", "ประธานบ้าน"),
      t("captain_role", "ตำแหน่งประธาน"),
      n("sort", "ลำดับ"),
    ],
  },
  {
    key: "honors",
    table: "honors",
    label: "รางวัลประจำเดือน",
    subtitle: "บ้านประจำเดือน และบ้านคุณธรรมเยี่ยม",
    primary: "month",
    canCreate: true,
    fields: [
      { key: "month", label: "เดือน", kind: "select", options: [...MONTHS] },
      t("house_of_month", "บ้านประจำเดือน (slug)"),
      t("character_house", "บ้านคุณธรรมเยี่ยม (slug)"),
    ],
  },
  {
    key: "clubs",
    table: "clubs",
    label: "ชุมนุม",
    subtitle: "ชุมนุมตามความสนใจ กิจกรรม และหัวหน้าชุมนุม",
    primary: "name",
    canCreate: true,
    canDelete: true,
    fields: [
      t("slug", "slug"),
      t("name", "ชื่ออังกฤษ"),
      t("name_th", "ชื่อไทย"),
      t("tagline", "คำโปรย"),
      { key: "about", label: "เกี่ยวกับชุมนุม", kind: "long" },
      t("head", "หัวหน้าชุมนุม"),
      n("member_count", "จำนวนสมาชิก"),
      { key: "activities", label: "กิจกรรมหลัก", kind: "list" },
      t("cls", "คลาสสี (เช่น house-st-mary)"),
      n("sort", "ลำดับ"),
    ],
  },
  {
    key: "news",
    table: "news",
    label: "ข่าวและประกาศ",
    subtitle: "เขียน แก้ไข และเผยแพร่ข่าว",
    primary: "title",
    canCreate: true,
    canDelete: true,
    fields: [
      t("slug", "slug"),
      t("title", "หัวข้อ"),
      { key: "cat", label: "หมวด", kind: "select", options: ["SGSC", "STUDENT GOVERNMENT", "HOUSE", "CLUB"] },
      t("date_label", "วันที่"),
      { key: "intro", label: "เกริ่นนำ", kind: "long" },
      { key: "body", label: "เนื้อหา (บรรทัดละย่อหน้า)", kind: "list" },
      t("related", "เกี่ยวข้องกับ"),
      t("house_slug", "slug บ้าน (ถ้ามี)"),
      img("cover_url", "รูปปก"),
      { key: "published", label: "เผยแพร่", kind: "bool" },
    ],
  },
  {
    key: "complaints",
    table: "complaints",
    label: "เรื่องร้องเรียน",
    subtitle: "ดู ติดตามสถานะ และบันทึกผลการดำเนินการของเรื่องที่นักเรียนส่งเข้ามา",
    primary: "subject",
    canDelete: true,
    fields: [
      t("subject", "หัวข้อเรื่อง"),
      {
        key: "cat",
        label: "หมวด",
        kind: "select",
        options: ["FACILITY", "ACADEMIC", "ACTIVITY", "WELFARE", "SAFETY", "SUGGESTION", "OTHER"],
      },
      { key: "detail", label: "รายละเอียด", kind: "long" },
      t("reporter", "ผู้ร้องเรียน"),
      t("klass", "ชั้น/ห้อง"),
      t("contact", "ช่องทางติดต่อ"),
      { key: "anonymous", label: "ไม่ระบุชื่อ", kind: "bool" },
      {
        key: "status",
        label: "สถานะ",
        kind: "select",
        options: ["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"],
      },
      { key: "admin_note", label: "บันทึกของผู้ดูแล", kind: "long" },
    ],
  },
  {
    key: "site_settings",
    table: "site_settings",
    label: "ตั้งค่าเว็บไซต์",
    subtitle: "ค่าทั่วไป เช่น เดือนปัจจุบันของ House Competition",
    primary: "key",
    canCreate: true,
    fields: [t("key", "คีย์"), t("value", "ค่า")],
  },
];

/* -------------------------------- page --------------------------------- */

function AdminPage() {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === null) return <Centered>กำลังตรวจสอบสิทธิ์…</Centered>;
  if (!session) return <SignIn />;
  return <Console />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-secondary px-5 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const email = username.includes("@") ? username.trim() : `${username.trim().toLowerCase()}@sgsc.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary px-5">
      <form onSubmit={submit} className="w-full max-w-sm border border-border bg-background p-8">
        <p className="eyebrow">SGSC ADMIN</p>
        <h1 className="display-xl mt-3 text-2xl">ระบบจัดการเว็บไซต์</h1>
        <p className="mt-3 text-xs text-muted-foreground">สำหรับผู้ดูแลระบบเท่านั้น</p>
        <label className="mt-8 block text-xs font-semibold uppercase tracking-[0.16em]">ชื่อผู้ใช้</label>
        <input
          required
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm"
        />
        <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em]">รหัสผ่าน</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-input bg-background px-3 py-3 text-sm"
        />
        <button
          disabled={busy}
          className="mt-8 w-full bg-primary px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}

function Console() {
  const check = useServerFn(checkAdmin);
  const me = useQuery({ queryKey: ["admin", "me"], queryFn: () => check() });
  const [section, setSection] = useState<string>("scores");

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (me.isLoading) return <Centered>กำลังโหลด…</Centered>;
  if (!me.data?.isAdmin)
    return (
      <Centered>
        <div className="max-w-sm text-center">
          <p className="text-base font-semibold text-foreground">บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ</p>
          <p className="mt-2">ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์ แล้วเข้าสู่ระบบอีกครั้ง</p>
          <button onClick={signOut} className="mt-6 border border-input px-5 py-3 text-xs uppercase tracking-[0.16em]">
            ออกจากระบบ
          </button>
        </div>
      </Centered>
    );

  const active = SECTIONS.find((s) => s.key === section);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-5 py-4 md:px-8">
        <div>
          <p className="eyebrow">SGSC ADMIN</p>
          <h1 className="display-xl mt-1 text-xl">ระบบจัดการเว็บไซต์</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{me.data.email}</span>
          <a href="/" className="border border-input px-4 py-2 text-xs uppercase tracking-[0.16em]">
            ดูเว็บไซต์
          </a>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 border border-input px-4 py-2 text-xs uppercase tracking-[0.16em]"
          >
            <LogOut className="h-3.5 w-3.5" /> ออก
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[240px_1fr]">
        <nav className="border-b border-border bg-background p-3 lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap gap-1 lg:flex-col">
            <NavBtn active={section === "scores"} onClick={() => setSection("scores")}>
              คะแนน House Competition
            </NavBtn>
            <NavBtn active={section === "radio"} onClick={() => setSection("radio")}>
              SG Radio
            </NavBtn>
            {SECTIONS.map((s) => (
              <NavBtn key={s.key} active={section === s.key} onClick={() => setSection(s.key)}>
                {s.label}
              </NavBtn>
            ))}
            <NavBtn active={section === "audit"} onClick={() => setSection("audit")}>
              ประวัติการแก้ไข
            </NavBtn>
          </div>
        </nav>

        <main className="p-5 md:p-8">
          {section === "scores" && <ScoreEditor />}
          {section === "radio" && <RadioAdminPanel />}
          {section === "audit" && <AuditView />}
          {active && <TableEditor key={active.key} def={active} />}
        </main>
      </div>
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2.5 text-left text-xs font-semibold transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

/* ---------------------------- generic editor ---------------------------- */

type Row = Record<string, any>;

function useRows(table: string) {
  const list = useServerFn(adminList);
  return useQuery({ queryKey: ["admin", table], queryFn: () => list({ data: { table } }) });
}

function TableEditor({ def }: { def: SectionDef }) {
  const qc = useQueryClient();
  const rows = useRows(def.table);
  const save = useServerFn(adminSave);
  const del = useServerFn(adminDelete);
  const [editing, setEditing] = useState<Row | null>(null);

  const saveMut = useMutation({
    mutationFn: (row: Row) => save({ data: { table: def.table, row } }),
    onSuccess: () => {
      toast.success("บันทึกแล้ว");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", def.table] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { table: def.table, id } }),
    onSuccess: () => {
      toast.success("ลบแล้ว");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", def.table] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const blank = useMemo(() => {
    const r: Row = {};
    def.fields.forEach((f) => {
      r[f.key] = f.kind === "number" ? 0 : f.kind === "bool" ? false : f.kind === "list" ? [] : "";
    });
    return r;
  }, [def]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display-xl text-2xl">{def.label}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{def.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => rows.refetch()}
            className="inline-flex items-center gap-2 border border-input bg-background px-4 py-3 text-xs uppercase tracking-[0.16em]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> โหลดใหม่
          </button>
          {def.canCreate && (
            <button
              onClick={() => setEditing({ ...blank })}
              className="inline-flex items-center gap-2 bg-primary px-4 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> เพิ่มรายการ
            </button>
          )}
        </div>
      </div>

      {rows.isLoading && <p className="mt-8 text-sm text-muted-foreground">กำลังโหลด…</p>}
      {rows.error && <p className="mt-8 text-sm text-destructive">{(rows.error as Error).message}</p>}

      <div className="mt-8 divide-y divide-border border border-border bg-background">
        {(rows.data ?? []).map((r: Row) => (
          <button
            key={String(r["id"] ?? r["key"])}
            onClick={() => setEditing(r)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {String(r[def.primary] ?? "").trim() || "(ยังไม่ระบุ)"}
              </span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                {def.fields
                  .slice(0, 4)
                  .map((f) => `${f.label}: ${fmt(r[f.key])}`)
                  .join(" · ")}
              </span>
            </span>
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">แก้ไข</span>
          </button>
        ))}
        {rows.data?.length === 0 && <p className="px-5 py-8 text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>}
      </div>

      {editing && (
        <RowForm
          def={def}
          row={editing}
          busy={saveMut.isPending || delMut.isPending}
          onClose={() => setEditing(null)}
          onSave={(r) => saveMut.mutate(r)}
          onDelete={
            def.canDelete && editing["id"] ? () => delMut.mutate(String(editing["id"])) : undefined
          }
        />
      )}
    </section>
  );
}

const fmt = (v: unknown) =>
  Array.isArray(v) ? `${v.length} รายการ` : typeof v === "boolean" ? (v ? "ใช่" : "ไม่") : String(v ?? "").slice(0, 40) || "—";

function RowForm({
  def,
  row,
  busy,
  onClose,
  onSave,
  onDelete,
}: {
  def: SectionDef;
  row: Row;
  busy: boolean;
  onClose: () => void;
  onSave: (r: Row) => void;
  onDelete?: (() => void) | undefined;
}) {
  const [draft, setDraft] = useState<Row>(() => ({ ...row }));
  const set = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-end overflow-y-auto bg-black/40 p-0 sm:place-items-center sm:p-6">
      <div className="w-full max-w-2xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-sm font-semibold">{def.label}</p>
          <button onClick={onClose} aria-label="ปิด">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
          {def.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em]">{f.label}</label>
              {f.kind === "long" && (
                <textarea
                  rows={3}
                  value={String(draft[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm"
                />
              )}
              {f.kind === "list" && (
                <textarea
                  rows={4}
                  value={(Array.isArray(draft[f.key]) ? draft[f.key] : []).join("\n")}
                  onChange={(e) => set(f.key, e.target.value.split("\n").filter((x) => x.trim()))}
                  className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm"
                  placeholder="บรรทัดละหนึ่งรายการ"
                />
              )}
              {f.kind === "select" && (
                <select
                  value={String(draft[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              )}
              {f.kind === "bool" && (
                <label className="mt-2 flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={!!draft[f.key]}
                    onChange={(e) => set(f.key, e.target.checked)}
                  />
                  เผยแพร่บนเว็บไซต์
                </label>
              )}
              {f.kind === "number" && (
                <input
                  type="number"
                  value={Number(draft[f.key] ?? 0)}
                  onChange={(e) => set(f.key, Number(e.target.value))}
                  className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm"
                />
              )}
              {f.kind === "image" && (
                <ImageField value={String(draft[f.key] ?? "")} onChange={(v) => set(f.key, v)} />
              )}
              {f.kind === "text" && (
                <input
                  value={String(draft[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          {onDelete ? (
            <button
              onClick={onDelete}
              disabled={busy}
              className="inline-flex items-center gap-2 border border-destructive px-4 py-3 text-xs uppercase tracking-[0.16em] text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> ลบ
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={() => onSave(draft)}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- image field ----------------------------- */

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type || "application/octet-stream",
      });
      if (error) throw new Error(error.message);
      onChange(`/api/public/img/${path}`);
      toast.success("อัปโหลดรูปภาพแล้ว");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 flex items-center gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden border border-border bg-muted">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 border border-input px-4 py-2 text-xs uppercase tracking-[0.16em]">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {busy ? "กำลังอัปโหลด" : "อัปโหลดรูปภาพ"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void upload(file);
            }}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-2 border border-destructive px-4 py-2 text-xs uppercase tracking-[0.16em] text-destructive"
          >
            <X className="h-3.5 w-3.5" /> ลบรูป
          </button>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- score editor ----------------------------- */

function ScoreEditor() {
  const qc = useQueryClient();
  const houses = useRows("houses");
  const scores = useRows("house_scores");
  const saveScores = useServerFn(adminSaveScores);
  const [month, setMonth] = useState<Month>(MONTHS[0]);
  const [draft, setDraft] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    (scores.data ?? []).forEach((s: Row) => {
      if (s["month"] === month) next[String(s["house_slug"])] = Number(s["score"]);
    });
    setDraft(next);
  }, [scores.data, month]);

  const mut = useMutation({
    mutationFn: () =>
      saveScores({
        data: {
          month,
          scores: (houses.data ?? []).map((h: Row) => ({
            house_slug: String(h["slug"]),
            score: draft[String(h["slug"])] ?? 0,
          })),
        },
      }),
    onSuccess: () => {
      toast.success("บันทึกคะแนนแล้ว");
      qc.invalidateQueries({ queryKey: ["admin", "house_scores"] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section>
      <h2 className="display-xl text-2xl">คะแนน House Competition</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        ใส่คะแนน 0–100 ของแต่ละบ้านในเดือนที่เลือก แล้วกดบันทึก
      </p>

      <div className="mt-6 flex flex-wrap gap-1">
        {MONTHS.map((m) => (
          <button
            key={m}
            onClick={() => setMonth(m)}
            className={cn(
              "num border px-4 py-2 text-xs",
              m === month ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
            )}
          >
            {m} · {MONTH_TH[m]}
          </button>
        ))}
      </div>

      <div className="mt-8 divide-y divide-border border border-border bg-background">
        {(houses.data ?? []).map((h: Row) => (
          <div key={String(h["slug"])} className="flex items-center justify-between gap-4 px-5 py-3">
            <span className="text-sm font-semibold">
              {String(h["name"])} <span className="text-muted-foreground">· {String(h["name_th"])}</span>
            </span>
            <input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={draft[String(h["slug"])] ?? 0}
              onChange={(e) =>
                setDraft((d) => ({ ...d, [String(h["slug"])]: Number(e.target.value) }))
              }
              className="num w-28 border border-input bg-background px-3 py-2 text-right text-sm"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-4 text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
      >
        <Save className="h-4 w-4" /> บันทึกคะแนนเดือน {MONTH_TH[month]}
      </button>
    </section>
  );
}

/* -------------------------------- audit -------------------------------- */

function AuditView() {
  const rows = useRows("audit_log");
  const list = [...(rows.data ?? [])].reverse();
  return (
    <section>
      <h2 className="display-xl text-2xl">ประวัติการแก้ไข</h2>
      <div className="mt-8 divide-y divide-border border border-border bg-background">
        {list.map((r: Row) => (
          <div key={String(r["id"])} className="px-5 py-3">
            <p className="text-sm">{String(r["action"])}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {String(r["actor"])} · {new Date(String(r["created_at"])).toLocaleString("th-TH")}
            </p>
          </div>
        ))}
        {list.length === 0 && <p className="px-5 py-8 text-sm text-muted-foreground">ยังไม่มีประวัติ</p>}
      </div>
    </section>
  );
}
