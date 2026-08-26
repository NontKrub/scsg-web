import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionHead, Tag } from "@/components/site/primitives";
import { getRadioPageData, submitRadioBooking } from "@/lib/content.functions";
import type { RadioBookingStatus, RadioSlot, RadioSlotState } from "@/lib/radio/types";

const STATE_TH: Record<RadioSlotState, string> = {
  AVAILABLE: "ว่าง",
  PENDING: "รออนุมัติ",
  BOOKED: "ถูกจอง",
  CLOSED: "ปิด",
};

const STATUS_TH: Record<RadioBookingStatus, string> = {
  PENDING: "รออนุมัติ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ปฏิเสธ",
  COMPLETED: "ออกอากาศแล้ว",
  CANCELLED: "ยกเลิก",
};

const radioPageQuery = {
  queryKey: ["radio-page"],
  queryFn: () => getRadioPageData(),
  staleTime: 15_000,
};

type FormState = {
  requester: string;
  studentId: string;
  klass: string;
  song: string;
  message: string;
  additionalInfo: string;
  acceptedRules: boolean;
};

const EMPTY_FORM: FormState = {
  requester: "",
  studentId: "",
  klass: "",
  song: "",
  message: "",
  additionalInfo: "",
  acceptedRules: false,
};

function dateParts(date: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).formatToParts(new Date(`${date}T00:00:00Z`));
  return {
    weekday: parts.find((part) => part.type === "weekday")?.value ?? "—",
    month: parts.find((part) => part.type === "month")?.value ?? "—",
    day: parts.find((part) => part.type === "day")?.value ?? "—",
  };
}

function timeLabel(time: string) {
  return time.slice(0, 5);
}

function stateClass(state: RadioSlotState) {
  if (state === "AVAILABLE") return "border-primary text-primary";
  if (state === "PENDING") return "border-muted-foreground/50 text-muted-foreground";
  return "border-border text-muted-foreground/60";
}

export function RadioPage() {
  const queryClient = useQueryClient();
  const sendBooking = useServerFn(submitRadioBooking);
  const query = useQuery(radioPageQuery);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<{
    id: string;
    date: string;
    startTime: string;
    status: RadioBookingStatus;
  } | null>(null);

  const slots = query.isError ? [] : (query.data?.slots ?? []);
  const rules = query.isError ? [] : (query.data?.rules ?? []);
  const dates = useMemo(() => [...new Set(slots.map((slot) => slot.date))].sort(), [slots]);
  const selectedSlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [selectedDate, slots],
  );
  const selectedSlot = selectedSlots.find((slot) => slot.id === selectedSlotId);

  useEffect(() => {
    if (!dates.length) {
      setSelectedDate("");
      setSelectedSlotId("");
      return;
    }
    if (!dates.includes(selectedDate)) {
      setSelectedDate(dates[0]!);
      setSelectedSlotId("");
    }
  }, [dates, selectedDate]);

  useEffect(() => {
    if (!selectedSlot || selectedSlot.state !== "AVAILABLE") setSelectedSlotId("");
  }, [selectedSlot]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSlot || selectedSlot.state !== "AVAILABLE") {
      setError("กรุณาเลือกช่วงเวลาที่ว่าง");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const result = await sendBooking({ data: { ...form, slotId: selectedSlot.id } });
      setConfirmation({
        id: result.booking.id,
        date: result.booking.date,
        startTime: result.booking.startTime,
        status: result.booking.status,
      });
      setStatus("sent");
      setForm(EMPTY_FORM);
      setSelectedSlotId("");
      await queryClient.invalidateQueries({ queryKey: ["radio-page"] });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "ส่งคำขอไม่สำเร็จ");
      setStatus("error");
      await queryClient.invalidateQueries({ queryKey: ["radio-page"] });
    }
  };

  return (
    <>
      <Section className="pb-10">
        <Tag>โครงการสโมสรนักเรียน</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,6.5rem)]">SG RADIO</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          เลือกวันและช่วงเวลาจริงเพื่อขอเพลงหรือส่งข้อความถึงเพื่อน คำขอทุกครั้งต้องรอทีมงานอนุมัติ
        </p>
      </Section>

      <Section className="pt-0">
        <SectionHead eyebrow="ตารางออกอากาศ" title="RADIO SCHEDULE" />
        {query.isPending && (
          <div
            role="status"
            aria-busy="true"
            className="border border-border bg-secondary p-6 text-sm text-muted-foreground"
          >
            กำลังโหลดตารางออกอากาศ…
          </div>
        )}
        {query.isError && (
          <div
            role="alert"
            className="border border-destructive bg-secondary p-6 text-sm text-destructive"
          >
            Unable to load schedule · ไม่สามารถโหลดตารางออกอากาศได้ กรุณาลองใหม่
          </div>
        )}
        {!query.isPending && !query.isError && dates.length === 0 && (
          <div
            role="status"
            className="border border-border bg-secondary p-6 text-sm text-muted-foreground"
          >
            ยังไม่มีวันออกอากาศที่เปิดให้จอง
          </div>
        )}
        {dates.length > 0 && (
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {dates.map((date) => {
              const display = dateParts(date);
              const count = slots.filter(
                (slot) => slot.date === date && slot.state === "AVAILABLE",
              ).length;
              return (
                <button
                  key={date}
                  type="button"
                  aria-pressed={selectedDate === date}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedSlotId("");
                  }}
                  className={`min-h-24 bg-background px-5 py-4 text-left transition-colors hover:bg-secondary ${
                    selectedDate === date
                      ? "bg-primary text-primary-foreground hover:bg-primary"
                      : ""
                  }`}
                >
                  <span className="eyebrow block">{display.weekday}</span>
                  <span className="num mt-1 block text-2xl">
                    {display.day} {display.month}
                  </span>
                  <span className="mt-2 block text-xs opacity-75">{count} ช่วงเวลาว่าง</span>
                </button>
              );
            })}
          </div>
        )}
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="เลือกช่วงเวลา" title="AVAILABLE TIMES" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="eyebrow">
              {selectedDate ? dateParts(selectedDate).weekday + " " + selectedDate : "เลือกวัน"}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {selectedSlots.map((slot) => (
                <SlotButton
                  key={slot.id}
                  slot={slot}
                  selected={selectedSlotId === slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                />
              ))}
              {selectedDate && selectedSlots.length === 0 && (
                <p className="border border-border bg-background p-4 text-sm text-muted-foreground">
                  วันนี้ยังไม่มีช่วงเวลา
                </p>
              )}
            </div>
          </div>

          <form onSubmit={submit} className="border border-border bg-background p-5 sm:p-7">
            <div className="mb-6 border-b border-border pb-5">
              <p className="eyebrow">ช่วงเวลาที่เลือก</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedSlot
                  ? `${selectedSlot.date} · ${timeLabel(selectedSlot.startTime)} น.`
                  : "ยังไม่ได้เลือกช่วงเวลา"}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                id="radio-requester"
                label="ชื่อ-นามสกุล"
                required
                value={form.requester}
                onChange={(value) => setField("requester", value)}
                placeholder="ชื่อของคุณ"
                maxLength={120}
              />
              <InputField
                id="radio-student-id"
                label="รหัสนักเรียน"
                required
                value={form.studentId}
                onChange={(value) => setField("studentId", value)}
                placeholder="เช่น SG-0001"
                maxLength={40}
              />
              <InputField
                id="radio-class"
                label="ชั้น / ห้อง"
                required
                value={form.klass}
                onChange={(value) => setField("klass", value)}
                placeholder="เช่น ม.5/1"
                maxLength={40}
              />
              <InputField
                id="radio-song"
                label="เพลง / เนื้อหาที่ขอ"
                required
                value={form.song}
                onChange={(value) => setField("song", value)}
                placeholder="ชื่อเพลง — ศิลปิน"
                maxLength={200}
              />
            </div>
            <TextField
              id="radio-message"
              label="ข้อความ / คำอุทิศ"
              value={form.message}
              onChange={(value) => setField("message", value)}
              placeholder="ข้อความสั้น ๆ ถึงเพื่อน"
              maxLength={600}
            />
            <TextField
              id="radio-additional"
              label="ข้อมูลเพิ่มเติม"
              value={form.additionalInfo}
              onChange={(value) => setField("additionalInfo", value)}
              placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
              maxLength={1000}
            />
            <label className="mt-5 flex items-start gap-3 text-sm">
              <input
                id="radio-rules"
                type="checkbox"
                required
                checked={form.acceptedRules}
                onChange={(event) => setField("acceptedRules", event.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>ฉันอ่านและยอมรับกติกาการใช้บริการ SG Radio</span>
            </label>
            <button
              type="submit"
              disabled={
                status === "sending" ||
                !selectedSlot ||
                selectedSlot.state !== "AVAILABLE" ||
                !form.acceptedRules ||
                query.isError
              }
              className="mt-6 w-full bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "sending" ? "กำลังส่ง…" : "ส่งคำขอจองคิว"}
            </button>
            {status === "sent" && confirmation && (
              <div
                role="status"
                aria-live="polite"
                className="mt-5 border border-primary p-4 text-sm"
              >
                <p className="font-semibold">Booking received · รับคำขอแล้ว</p>
                <p className="mt-2">Reference: {confirmation.id}</p>
                <p>
                  วันที่: {confirmation.date} · เวลา: {timeLabel(confirmation.startTime)} น.
                </p>
                <p>สถานะ: {STATUS_TH[confirmation.status]}</p>
              </div>
            )}
            {status === "error" && (
              <p role="alert" className="mt-5 text-sm text-destructive">
                {error}
              </p>
            )}
          </form>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="กติกาการใช้บริการ" title="RADIO RULES" />
        <ol className="max-w-3xl">
          {rules.map((rule, index) => (
            <li
              key={`${rule}-${index}`}
              className="flex gap-5 border-t border-border py-5 last:border-b"
            >
              <span className="num text-sm text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm">{rule}</span>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}

function SlotButton({
  slot,
  selected,
  onClick,
}: {
  slot: RadioSlot;
  selected: boolean;
  onClick: () => void;
}) {
  const available = slot.state === "AVAILABLE";
  return (
    <button
      type="button"
      disabled={!available}
      aria-label={`${timeLabel(slot.startTime)} ${STATE_TH[slot.state]}`}
      aria-pressed={selected}
      data-state={slot.state}
      onClick={onClick}
      className={`flex min-h-14 items-center justify-between border bg-background px-4 py-3 text-left transition-colors ${stateClass(slot.state)} ${
        selected ? "border-2 bg-primary text-primary-foreground" : ""
      } disabled:cursor-not-allowed disabled:opacity-70`}
    >
      <span className="num text-lg">{timeLabel(slot.startTime)}</span>
      <span className="text-xs font-semibold">{STATE_TH[slot.state]}</span>
    </button>
  );
}

function InputField({
  id,
  label,
  required,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="eyebrow">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        id={id}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
      />
    </label>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
}) {
  return (
    <label htmlFor={id} className="mt-5 block">
      <span className="eyebrow">{label}</span>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
      />
    </label>
  );
}
