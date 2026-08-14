import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ADMIN_ROLES,
  AUDIT_LOG,
  CLUBS,
  CURRENT_MONTH,
  HOUSES,
  NEWS,
  PROJECTS,
  RADIO_DAYS,
  RADIO_SCHEDULE,
  RADIO_SLOTS,
  TOTAL_MEMBERS,
} from "@/data/sgsc";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — ระบบจัดการเว็บไซต์ SGSC" },
      { name: "description", content: "ระบบหลังบ้านสำหรับจัดการสมาชิก คะแนนบ้าน ชมรม โครงการ SG Radio และข่าวของ SGSC" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "SGSC Admin Console" },
      { property: "og:description", content: "ระบบจัดการเนื้อหาและคะแนนของ SGSC" },
    ],
  }),
  component: Admin,
});

const TABS = ["DASHBOARD", "MEMBERS", "SCORES", "CLUBS", "PROJECTS", "RADIO", "NEWS", "ROLES"] as const;

function Admin() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("DASHBOARD");

  return (
    <div className="min-h-screen bg-secondary">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-5 py-4 md:px-8">
        <div>
          <p className="eyebrow">SGSC ADMIN CONSOLE</p>
          <p className="mt-1 text-sm text-muted-foreground">เข้าสู่ระบบเป็น Super Admin (ตัวอย่าง)</p>
        </div>
        <Link to="/" className="num text-xs uppercase tracking-[0.18em] underline">
          ← กลับหน้าเว็บไซต์
        </Link>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr]">
        <nav className="border-b border-border bg-background lg:border-b-0 lg:border-r">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`num block w-full px-5 py-4 text-left text-xs uppercase tracking-[0.16em] ${
                tab === t ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <main className="p-5 md:p-8">
          {tab === "DASHBOARD" && (
            <>
              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { v: String(TOTAL_MEMBERS), l: "สมาชิกทั้งหมด" },
                  { v: "09", l: "บ้านนักบุญ" },
                  { v: String(PROJECTS.length), l: "โครงการ" },
                  { v: String(NEWS.length), l: "ข่าวเผยแพร่" },
                ].map((s) => (
                  <div key={s.l} className="bg-background p-6">
                    <p className="num text-3xl">{s.v}</p>
                    <p className="eyebrow mt-3">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border border-border bg-background p-6">
                <p className="eyebrow">AUDIT LOG</p>
                {AUDIT_LOG.map((a) => (
                  <div key={a.time} className="flex flex-wrap justify-between gap-2 border-t border-border py-3">
                    <span className="text-sm">{a.action}</span>
                    <span className="num text-xs text-muted-foreground">
                      {a.time} · {a.by}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "MEMBERS" && (
            <Panel title="จัดการสมาชิก" desc="เพิ่ม แก้ไข ลบ และย้ายสังกัดสมาชิกสภานักเรียน">
              <Rows
                rows={["เพิ่มสมาชิกใหม่", "นำเข้ารายชื่อจากไฟล์", "จัดกลุ่มตามองค์กร", "อัปโหลดรูปสมาชิก"]}
              />
            </Panel>
          )}

          {tab === "SCORES" && (
            <Panel title={`คะแนนบ้าน — ${CURRENT_MONTH} 2026`} desc="แก้ไขคะแนนรายเดือนและเผยแพร่ผล">
              <div className="grid gap-px bg-border sm:grid-cols-3">
                {HOUSES.map((h) => (
                  <div key={h.slug} className="bg-background p-5">
                    <p className="num text-xs text-muted-foreground">{h.no}</p>
                    <p className="mt-2 text-sm font-semibold">{h.name}</p>
                    <input
                      defaultValue={h.scores[CURRENT_MONTH]}
                      className="num mt-3 w-full border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
              <button className="mt-6 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground">
                บันทึกและเผยแพร่
              </button>
            </Panel>
          )}

          {tab === "CLUBS" && (
            <Panel title="จัดการชมรม" desc="แก้ไขข้อมูล กิจกรรม และคณะกรรมการของแต่ละชมรม">
              <Rows rows={CLUBS.map((c) => `${c.name} · ${c.members} สมาชิก · หัวหน้า ${c.head}`)} />
            </Panel>
          )}

          {tab === "PROJECTS" && (
            <Panel title="จัดการโครงการ" desc="อัปเดตสถานะและความคืบหน้าของโครงการ">
              <Rows rows={PROJECTS.map((p) => `${p.name} · ${p.status} · ${p.owner}`)} />
            </Panel>
          )}

          {tab === "RADIO" && (
            <Panel title="SG Radio" desc="อนุมัติคำขอจอง เปิด/ปิดช่วงเวลา และดูคิวรายวัน">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <tbody>
                    {RADIO_DAYS.map((d) => (
                      <tr key={d}>
                        <td className="border-b border-border p-3 font-semibold">{d}</td>
                        {RADIO_SCHEDULE[d]!.map((s, i) => (
                          <td key={i} className="num border-b border-border p-3 text-xs text-muted-foreground">
                            {RADIO_SLOTS[i]} · {s}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {tab === "NEWS" && (
            <Panel title="จัดการข่าว" desc="สร้าง แก้ไข และเผยแพร่ข่าวประกาศ">
              <Rows rows={NEWS.map((n) => `${n.date} · ${n.cat} · ${n.title}`)} />
            </Panel>
          )}

          {tab === "ROLES" && (
            <Panel title="สิทธิ์ผู้ใช้งาน" desc="ระดับสิทธิ์และขอบเขตการเข้าถึงของแต่ละบทบาท">
              <div className="grid gap-px bg-border sm:grid-cols-2">
                {ADMIN_ROLES.map((r) => (
                  <div key={r.role} className="bg-background p-5">
                    <p className="num text-sm">{r.role}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{r.desc}</p>
                    <p className="num mt-3 text-xs">{r.people} คน</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </main>
      </div>
    </div>
  );
}

function Panel({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-background p-6">
      <h2 className="display-xl text-xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: string[] }) {
  return (
    <ul>
      {rows.map((r) => (
        <li key={r} className="flex items-center justify-between gap-4 border-t border-border py-3 last:border-b">
          <span className="text-sm">{r}</span>
          <span className="num text-xs text-muted-foreground">แก้ไข</span>
        </li>
      ))}
    </ul>
  );
}
