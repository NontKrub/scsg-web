import { createFileRoute } from "@tanstack/react-router";
import { RadioPage } from "@/components/site/RadioPage";

export const Route = createFileRoute("/radio")({
  head: () => ({
    meta: [
      { title: "SG Radio — จองคิวเสียงตามสาย | SGSC" },
      {
        name: "description",
        content:
          "จองคิว SG Radio เสียงตามสายช่วงพักกลางวัน ดูตารางออกอากาศ ช่วงเวลาที่ว่าง และกติกาการขอเพลง",
      },
      { property: "og:title", content: "SG RADIO — เสียงตามสายพักกลางวัน" },
      { property: "og:description", content: "จองคิวขอเพลงและส่งข้อความถึงเพื่อนผ่าน SG Radio" },
    ],
  }),
  component: Radio,
});

function Radio() {
  return <RadioPage />;
}
