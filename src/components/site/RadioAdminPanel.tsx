import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { RefreshCw, Save, X } from "lucide-react";
import { toast } from "sonner";
import { radioAdminAction, getRadioAdminData, saveRadioSlot } from "@/lib/admin.functions";
import type { RadioBooking, RadioSlot, RadioSlotDraft, RadioSlotState } from "@/lib/radio/types";

const STATE_TH: Record<RadioSlotState, string> = {
  AVAILABLE: "ว่าง",
  PENDING: "รออนุมัติ",
  BOOKED: "ถูกจอง",
  CLOSED: "ปิด",
};

const adminQuery = {
  queryKey: ["admin", "radio"],
  queryFn: () => getRadioAdminData(),
};

const EMPTY_SLOT: RadioSlotDraft = { date: "", startTime: "08:05", note: "" };
const ACTIVE_BOOKING_STATUSES = new Set<RadioBooking["status"]>(["PENDING", "APPROVED"]);

export function RadioAdminPanel() {
  const queryClient = useQueryClient();
  const query = useQuery(adminQuery);
  const save = useServerFn(saveRadioSlot);
  const action = useServerFn(radioAdminAction);
  const [draft, setDraft] = useState<RadioSlotDraft | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>();

  const saveMutation = useMutation({
    mutationFn: () => save({ data: editingId ? { id: editingId, ...draft! } : { ...draft! } }),
    onSuccess: () => {
      toast.success("บันทึกช่วงเวลาแล้ว");
      setDraft(null);
      setEditingId(undefined);
      void queryClient.invalidateQueries({ queryKey: ["admin", "radio"] });
      void queryClient.invalidateQueries({ queryKey: ["radio-page"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const actionMutation = useMutation({
    mutationFn: ({
      id,
      kind,
    }: {
      id: string;
      kind: "approve" | "reject" | "complete" | "cancel" | "close" | "reopen";
    }) => action({ data: { id, action: kind } }),
    onSuccess: () => {
      toast.success("อัปเดต SG Radio แล้ว");
      void queryClient.invalidateQueries({ queryKey: ["admin", "radio"] });
      void queryClient.invalidateQueries({ queryKey: ["radio-page"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const slots = [...(query.data?.slots ?? [])].sort((a, b) =>
    `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
  );
  const bookings = [...(query.data?.bookings ?? [])].sort((a, b) => {
    const activeOrder =
      Number(ACTIVE_BOOKING_STATUSES.has(b.status)) -
      Number(ACTIVE_BOOKING_STATUSES.has(a.status));
    return activeOrder || b.createdAt.localeCompare(a.createdAt);
  });
  const busy = saveMutation.isPending || actionMutation.isPending;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">RADIO ADMIN</p>
          <h2 className="display-xl mt-2 text-2xl">จัดการ SG Radio</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ตารางวันที่จริงและคำขอจองในคิวเดียวกัน
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="inline-flex items-center gap-2 border border-input bg-background px-4 py-3 text-xs uppercase tracking-[0.16em]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> โหลดใหม่
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingId(undefined);
              setDraft({ ...EMPTY_SLOT });
            }}
            className="bg-primary px-4 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground"
          >
            เพิ่มช่วงเวลา
          </button>
        </div>
      </div>

      {query.isPending && (
        <p role="status" className="mt-8 text-sm text-muted-foreground">
          กำลังโหลด…
        </p>
      )}
      {query.isError && (
        <p role="alert" className="mt-8 text-sm text-destructive">
          {(query.error as Error).message}
        </p>
      )}

      {draft && (
        <SlotForm
          draft={draft}
          editing={!!editingId}
          busy={busy}
          onChange={setDraft}
          onClose={() => {
            setDraft(null);
            setEditingId(undefined);
          }}
          onSave={() => saveMutation.mutate()}
        />
      )}

      <div className="mt-8">
        <h3 className="eyebrow">SCHEDULE</h3>
        <div className="mt-3 grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot) => (
            <div key={slot.id} className="bg-background p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="num text-xl">{slot.date}</p>
                  <p className="num mt-1 text-3xl">{slot.startTime.slice(0, 5)}</p>
                </div>
                <span
                  className={`border px-2 py-1 text-[10px] font-semibold uppercase ${slot.state === "AVAILABLE" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
                >
                  {STATE_TH[slot.state]}
                </span>
              </div>
              {slot.note && <p className="mt-4 text-xs text-muted-foreground">{slot.note}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                {(slot.state === "AVAILABLE" || slot.state === "CLOSED") && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditingId(slot.id);
                      setDraft({
                        date: slot.date,
                        startTime: slot.startTime.slice(0, 5),
                        note: slot.note,
                      });
                    }}
                    className="border border-input px-3 py-2 text-xs uppercase tracking-[0.12em] disabled:opacity-50"
                  >
                    แก้ไข
                  </button>
                )}
                {slot.state === "AVAILABLE" && (
                  <ActionButton
                    busy={busy}
                    label="ปิดช่วงเวลา"
                    onClick={() => actionMutation.mutate({ id: slot.id, kind: "close" })}
                  />
                )}
                {slot.state === "CLOSED" && (
                  <ActionButton
                    busy={busy}
                    label="เปิดอีกครั้ง"
                    onClick={() => actionMutation.mutate({ id: slot.id, kind: "reopen" })}
                  />
                )}
              </div>
            </div>
          ))}
          {!query.isPending && slots.length === 0 && (
            <p className="bg-background p-6 text-sm text-muted-foreground">
              ยังไม่มีช่วงเวลาวันที่จริง
            </p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="eyebrow">BOOKING QUEUE</h3>
        <div className="mt-3 divide-y divide-border border border-border bg-background">
          {bookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              busy={busy}
              onAction={(kind) => actionMutation.mutate({ id: booking.id, kind })}
            />
          ))}
          {!query.isPending && bookings.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">ยังไม่มีคำขอจอง</p>
          )}
        </div>
      </div>
    </section>
  );
}

function SlotForm({
  draft,
  editing,
  busy,
  onChange,
  onClose,
  onSave,
}: {
  draft: RadioSlotDraft;
  editing: boolean;
  busy: boolean;
  onChange: (draft: RadioSlotDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-8 border border-border bg-background p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">{editing ? "แก้ไขช่วงเวลา" : "เพิ่มช่วงเวลา"}</h3>
        <button type="button" aria-label="ปิดแบบฟอร์ม" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <label className="block">
          <span className="eyebrow">วันที่</span>
          <input
            type="date"
            required
            value={draft.date}
            onChange={(event) => onChange({ ...draft, date: event.target.value })}
            className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="eyebrow">เวลาเริ่ม</span>
          <input
            type="time"
            required
            value={draft.startTime}
            onChange={(event) => onChange({ ...draft, startTime: event.target.value })}
            className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="eyebrow">หมายเหตุ</span>
          <input
            maxLength={300}
            value={draft.note}
            onChange={(event) => onChange({ ...draft, note: event.target.value })}
            className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>
      <button
        type="button"
        disabled={busy || !draft.date || !draft.startTime}
        onClick={onSave}
        className="mt-5 inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-50"
      >
        <Save className="h-3.5 w-3.5" /> บันทึกช่วงเวลา
      </button>
    </div>
  );
}

function BookingRow({
  booking,
  busy,
  onAction,
}: {
  booking: RadioBooking;
  busy: boolean;
  onAction: (kind: "approve" | "reject" | "complete" | "cancel") => void;
}) {
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{booking.song}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.requester} · {booking.studentId} · {booking.klass}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {booking.slot?.date ?? "legacy"} · {booking.slot?.startTime.slice(0, 5) ?? "—"}
          </p>
          {!booking.slotId && (
            <p className="mt-1 text-xs text-muted-foreground">ข้อมูลเดิมก่อนใช้ตารางวันที่จริง</p>
          )}
        </div>
        <span className="border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
          {booking.status}
        </span>
      </div>
      {booking.message && (
        <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{booking.message}</p>
      )}
      {booking.additionalInfo && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          ข้อมูลเพิ่มเติม: {booking.additionalInfo}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {booking.slotId && booking.status === "PENDING" && (
          <>
            <ActionButton busy={busy} label="อนุมัติ" onClick={() => onAction("approve")} />
            <ActionButton busy={busy} label="ปฏิเสธ" onClick={() => onAction("reject")} />
            <ActionButton busy={busy} label="ยกเลิก" onClick={() => onAction("cancel")} />
          </>
        )}
        {booking.slotId && booking.status === "APPROVED" && (
          <ActionButton busy={busy} label="ทำเสร็จแล้ว" onClick={() => onAction("complete")} />
        )}
      </div>
    </div>
  );
}

function ActionButton({
  busy,
  label,
  onClick,
}: {
  busy: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="border border-input px-3 py-2 text-xs uppercase tracking-[0.12em] disabled:opacity-50"
    >
      {label}
    </button>
  );
}
