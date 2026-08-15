import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TABLES = {
  houses: { pk: "id", order: "sort" },
  house_scores: { pk: "id", order: "house_slug" },
  honors: { pk: "id", order: "month" },
  members: { pk: "id", order: "sort" },
  congress_board: { pk: "id", order: "sort" },
  advisory_board: { pk: "id", order: "sort" },
  clubs: { pk: "id", order: "sort" },
  news: { pk: "id", order: "created_at" },

  radio_slots: { pk: "id", order: "day" },
  radio_bookings: { pk: "id", order: "created_at" },
  radio_rules: { pk: "id", order: "sort" },
  complaints: { pk: "id", order: "created_at" },
  site_settings: { pk: "key", order: "key" },
  audit_log: { pk: "id", order: "created_at" },
} as const;

export type AdminTable = keyof typeof TABLES;

const table = (name: string) => {
  const t = TABLES[name as AdminTable];
  if (!t) throw new Error(`ตารางไม่ถูกต้อง: ${name}`);
  return { name: name as AdminTable, ...t };
};

async function isAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  if (!(await isAdmin(ctx))) throw new Error("บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ");
}

/** Whether the signed-in account is an admin. */
export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    let admin = false;
    try {
      admin = await isAdmin(context);
    } catch {
      admin = false;
    }
    return { isAdmin: admin, userId: context.userId, email: (context.claims as { email?: string }).email ?? "" };
  });


/** Reads any managed table. */
export const adminList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: string }) => ({ table: data.table }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const t = table(data.table);
    const db = context.supabase as any;
    const res = await db.from(t.name).select("*").order(t.order, { ascending: true }).limit(1000);
    if (res.error) throw new Error(res.error.message);
    return (res.data ?? []) as Record<string, any>[];
  });

/** Creates or updates a row. */
export const adminSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: string; row: Record<string, any> }) => ({
    table: data.table,
    row: data.row ?? {},
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const t = table(data.table);
    const db = context.supabase as any;
    const row = { ...data.row };
    const hasPk = !!row[t.pk];
    const res = hasPk
      ? await db.from(t.name).update(row).eq(t.pk, row[t.pk] as string).select().maybeSingle()
      : await db.from(t.name).insert(row).select().maybeSingle();
    if (res.error) throw new Error(res.error.message);
    await context.supabase.from("audit_log").insert({
      action: `${hasPk ? "แก้ไข" : "เพิ่ม"}ข้อมูลใน ${t.name}`,
      actor: (context.claims as { email?: string }).email ?? context.userId,
    });
    return res.data as Record<string, any>;
  });

/** Deletes a row. */
export const adminDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: string; id: string }) => ({ table: data.table, id: String(data.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const t = table(data.table);
    const db = context.supabase as any;
    const res = await db.from(t.name).delete().eq(t.pk, data.id);
    if (res.error) throw new Error(res.error.message);
    await context.supabase.from("audit_log").insert({
      action: `ลบข้อมูลใน ${t.name}`,
      actor: (context.claims as { email?: string }).email ?? context.userId,
    });
    return { ok: true };
  });

/** Bulk-saves the monthly score grid. */
export const adminSaveScores = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { month: string; scores: { house_slug: string; score: number }[] }) => ({
    month: String(data.month),
    scores: (data.scores ?? []).map((s) => ({
      house_slug: String(s.house_slug),
      score: Math.max(0, Math.min(100, Number(s.score) || 0)),
    })),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    for (const s of data.scores) {
      const res = await (context.supabase as any)
        .from("house_scores")
        .upsert({ house_slug: s.house_slug, month: data.month, score: s.score }, { onConflict: "house_slug,month" });
      if (res.error) throw new Error(res.error.message);
    }
    await context.supabase.from("audit_log").insert({
      action: `บันทึกคะแนนบ้านเดือน ${data.month}`,
      actor: (context.claims as { email?: string }).email ?? context.userId,
    });
    return { ok: true };
  });
