import { createFileRoute } from "@tanstack/react-router";
import { MemberGrid } from "@/components/site/MemberGrid";
import { Section, SectionHead, Tag } from "@/components/site/primitives";
import { CLASS_ROOMS } from "@/data/sgsc";

export const Route = createFileRoute("/class-representatives")({
  head: () => ({
    meta: [
      { title: "Class Representatives — ผู้แทนห้องเรียน | SGSC" },
      { name: "description", content: "ผู้แทนห้องเรียนทุกระดับชั้น ผู้ส่งเสียงของเพื่อนร่วมห้องถึงสภานักเรียนผ่านโครงการ Voice Box" },
      { property: "og:title", content: "CLASS REPRESENTATIVES — SGSC" },
      { property: "og:description", content: "รายชื่อผู้แทนห้องเรียนและช่องทางส่งความคิดเห็น" },
    ],
  }),
  component: ClassReps,
});

function ClassReps() {
  return (
    <>
      <Section className="pb-10">
        <Tag>องค์กรที่ 4</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,6.5rem)]">CLASS REPRESENTATIVES</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          ทุกห้องเรียนมีผู้แทนที่รวบรวมความคิดเห็นของเพื่อน และนำเสนอต่อสภานักเรียนทุกเดือนผ่านโครงการ VOICE BOX
        </p>
      </Section>

      <Section className="pt-0">
        <SectionHead eyebrow="ผู้แทนตามห้องเรียน" title="BY CLASSROOM" />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {CLASS_ROOMS.map((c) => (
            <div key={c.room} className="bg-background p-6">
              <p className="num text-sm text-muted-foreground">{c.level}</p>
              <p className="display-xl mt-3 text-2xl">{c.room}</p>
              <p className="mt-4 text-sm">{c.rep}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead eyebrow="รายชื่อทั้งหมด" title="REPRESENTATIVES" />
        <MemberGrid initial="CLASS" />
      </Section>
    </>
  );
}
