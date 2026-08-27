import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateAdminRow, validateScoreBatch } from "./admin.validation";

const TABLES = {
  houses: { pk: "id", order: "sort" },
  house_scores: { pk: "id", order: "house_slug" },
  honors: { pk: "id", order: "month" },
  members: { pk: "id", order: "sort" },
  congress_board: { pk: "id", order: "sort" },
  advisory_board: { pk: "id", order: "sort" },
  clubs: { pk: "id", order: "sort" },
  news: { pk: "id", order: "created_at" },

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

function validateTableInput(data: unknown) {
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as Record<string, unknown>)["table"] !== "string"
  ) {
    throw new Error("ข้อมูลตารางไม่ถูกต้อง");
  }
  const tableName = (data as Record<string, unknown>)["table"];
  if (typeof tableName !== "string") throw new Error("ข้อมูลตารางไม่ถูกต้อง");
  return { table: tableName };
}

export async function isAdmin(ctx: { supabase: any; userId: string }) {
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
  .validator(validateTableInput)
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
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("ข้อมูลผู้ดูแลไม่ถูกต้อง");
    const input = data as Record<string, unknown>;
    const tableName = input["table"];
    if (typeof tableName !== "string") throw new Error("ข้อมูลตารางไม่ถูกต้อง");
    return { table: tableName, row: validateAdminRow(tableName, input["row"]) };
  })
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
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("ข้อมูลผู้ดูแลไม่ถูกต้อง");
    const input = data as Record<string, unknown>;
    const tableName = input["table"];
    const rowId = input["id"];
    if (typeof tableName !== "string" || typeof rowId !== "string" || !rowId.trim()) {
      throw new Error("ข้อมูลผู้ดูแลไม่ถูกต้อง");
    }
    return { table: tableName, id: rowId.trim() };
  })
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
  .validator(validateScoreBatch)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    for (const score of data.scores) {
      const res = await (context.supabase as any)
        .from("house_scores")
        .upsert(
          { ...score, month: data.month },
          { onConflict: "house_slug,month" },
        );
      if (res.error) throw new Error(res.error.message);
    }
    await context.supabase.from("audit_log").insert({
      action: `บันทึกคะแนนบ้านเดือน ${data.month}`,
      actor: (context.claims as { email?: string }).email ?? context.userId,
    });
    return { ok: true };
  });

type RadioAdminAction = "approve" | "reject" | "complete" | "cancel" | "close" | "reopen";

async function radioAdminService(context: { supabase: any; userId: string }) {
  await assertAdmin(context);
  const { getRadioService } = await import("./radio/server");
  return getRadioService(context.supabase);
}

async function auditRadioAction(context: { supabase: any; userId: string; claims: unknown }, action: string) {
  await context.supabase.from("audit_log").insert({
    action: `SG Radio: ${action}`,
    actor: (context.claims as { email?: string }).email ?? context.userId,
  });
}

/** Reads the schedule and booking queue through the Radio boundary. */
export const getRadioAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const service = await radioAdminService(context);
    const [slots, bookings] = await Promise.all([service.listSlots(), service.listBookings()]);
    return { slots, bookings };
  });

/** Creates or edits a date-based schedule row. */
export const saveRadioSlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id?: string; date: string; startTime: string; note: string }) => ({
    id: data.id ? String(data.id) : undefined,
    date: String(data.date ?? ""),
    startTime: String(data.startTime ?? ""),
    note: String(data.note ?? ""),
  }))
  .handler(async ({ data, context }) => {
    const service = await radioAdminService(context);
    const slot = await service.saveSlot(data.id, {
      date: data.date,
      startTime: data.startTime,
      note: data.note,
    });
    await auditRadioAction(context, data.id ? "แก้ไขช่วงเวลา" : "เพิ่มช่วงเวลา");
    return slot;
  });

/** Runs one named, validated Radio transition. */
export const radioAdminAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { action: string; id: string }) => {
    const action = String(data.action);
    if (!( ["approve", "reject", "complete", "cancel", "close", "reopen"] as string[]).includes(action)) {
      throw new Error("การดำเนินการ SG Radio ไม่ถูกต้อง");
    }
    return { action: action as RadioAdminAction, id: String(data.id) };
  })
  .handler(async ({ data, context }) => {
    const service = await radioAdminService(context);
    const result = data.action === "approve"
      ? await service.approve(data.id)
      : data.action === "reject"
        ? await service.reject(data.id)
        : data.action === "complete"
          ? await service.complete(data.id)
          : data.action === "cancel"
            ? await service.cancel(data.id)
            : data.action === "close"
              ? await service.closeSlot(data.id)
              : await service.reopenSlot(data.id);
    await auditRadioAction(context, data.action);
    return result;
  });
