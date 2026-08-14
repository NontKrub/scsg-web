import { createFileRoute } from "@tanstack/react-router";
import { MemberGrid } from "@/components/site/MemberGrid";
import { Section, Tag } from "@/components/site/primitives";
import { TOTAL_MEMBERS } from "@/data/sgsc";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "สมาชิกสภา SGSC — 68 ผู้นำนักเรียน" },
      { name: "description", content: "รายชื่อสมาชิกสภานักเรียนทั้ง 68 คน จาก 4 องค์กรของ SGSC" },
      { property: "og:title", content: "Congress Members — SGSC" },
      { property: "og:description", content: "68 ผู้นำนักเรียนจาก 4 องค์กร" },
    ],
  }),
  component: Members,
});

function Members() {
  return (
    <Section>
      <Tag>Congress Members</Tag>
      <h1 className="display-xl mt-6 text-[clamp(2.4rem,8vw,6rem)]">
        {TOTAL_MEMBERS} PEOPLE.
        <br />
        ONE CONGRESS.
      </h1>
      <p className="mt-6 max-w-lg text-muted-foreground">
        กรองตามองค์กรเพื่อดูสมาชิก คลิกที่การ์ดเพื่อดูข้อมูลและหน้าที่ของแต่ละคน
      </p>
      <div className="mt-14">
        <MemberGrid />
      </div>
    </Section>
  );
}
