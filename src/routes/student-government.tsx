import { useContent, ranking, rankOf, growth, honorsOf, membersOf, display } from "@/lib/content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MemberGrid } from "@/components/site/MemberGrid";
import { Section, SectionHead, Tag } from "@/components/site/primitives";

export const Route = createFileRoute("/student-government")({
  head: () => ({
    meta: [
      { title: "Student Government — สโมสรนักเรียน | SGSC" },
      {
        name: "description",
        content: "ฝ่ายบริหารของ SGSC ดูแลบริการเพื่อนักเรียนทั้งโรงเรียน พร้อมรายชื่อคณะทำงาน",
      },
      { property: "og:title", content: "STUDENT GOVERNMENT — SGSC" },
      { property: "og:description", content: "โครงสร้างและคณะทำงานของสโมสรนักเรียนคณะที่ 69" },
    ],
  }),
  component: SG,
});

function SG() {
  const c = useContent();
  return (
    <>
      <Section className="pb-10">
        <Tag>องค์กรที่ 1</Tag>
        <h1 className="display-xl mt-6 text-[clamp(2.6rem,9vw,6.5rem)]">STUDENT GOVERNMENT</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          สโมสรนักเรียน (Student Government) คือฝ่ายบริหารซึ่งเป็น 1 ใน 4 องค์กรภายใต้ Student
          Congress มีสมาชิก {membersOf(c, "SG").length} คน ตั้งแต่นายกสโมสรนักเรียน รองนายก
          เลขานุการ เหรัญญิก หัวหน้าฝ่าย จนถึงกรรมการฝ่าย และทั้ง {membersOf(c, "SG").length}{" "}
          คนนี้นับเป็นสมาชิกสภาใน {c.members.length} คนของ Student Congress ด้วย
        </p>
        <div className="mt-8 grid max-w-md grid-cols-2 gap-6">
          <div>
            <div className="num text-5xl">{membersOf(c, "SG").length}</div>
            <div className="eyebrow mt-1">สมาชิกสโมสรนักเรียน</div>
          </div>
          <div>
            <div className="num text-5xl">{c.members.length}</div>
            <div className="eyebrow mt-1">สมาชิกสภาใหญ่ทั้งหมด</div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow={`โครงสร้าง ${membersOf(c, "SG").length} ที่นั่ง`}
          title={`THE ${membersOf(c, "SG").length} SEATS`}
          sub={`รายชื่อคณะกรรมการสโมสรนักเรียนทั้ง ${membersOf(c, "SG").length} คน เรียงตามตำแหน่ง ทุกคนเป็นสมาชิกสภานักเรียน ${c.members.length} คนด้วย`}
        />
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {membersOf(c, "SG").map((m, i) => (
            <div key={m.id} className="bg-background p-6">
              <span className="num text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-sm font-semibold">{display(m.name)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{display(m.role)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="โครงการของสโมสรนักเรียน"
          title="SG RADIO"
          sub="SG Radio เป็นโครงการของสโมสรนักเรียนโดยเฉพาะ ดูแลโดยฝ่ายสื่อสาร เปิดให้นักเรียนจองคิวขอเพลงและส่งข้อความช่วงพักกลางวัน"
        />
        <div className="grid gap-px bg-border lg:grid-cols-[1.1fr_1fr]">
          <div className="bg-background p-7 md:p-10">
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/radio"
                className="inline-flex bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground"
              >
                จองคิว SG Radio
              </Link>
              <Link
                to="/radio"
                className="inline-flex border border-input px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                ตารางออกอากาศและกติกา
              </Link>
            </div>
          </div>
          <div className="bg-background p-7 md:p-10">
            <p className="eyebrow">ผู้รับผิดชอบ</p>
            <p className="mt-3 font-semibold">สโมสรนักเรียน</p>
            <p className="mt-6 text-sm text-muted-foreground">
              ออกอากาศทุกวันจันทร์–ศุกร์ ช่วง 8.05 น. เป็นต้นไป
              บริหารจัดการคิวผ่านระบบจองออนไลน์ของสโมสรนักเรียน
            </p>
          </div>
        </div>
      </Section>

      {/* SAMO SHOP */}
      <Section className="bg-secondary">
        <SectionHead
          eyebrow="ร้านค้าออนไลน์ของสโมสรนักเรียน"
          title="SAMO SHOP"
          sub="ร้านค้าออนไลน์อย่างเป็นทางการของสโมสรนักเรียน โรงเรียนเซนต์คาเบรียล เพื่อให้ครู นักเรียน ผู้ปกครอง และศิษย์เก่า เข้าถึงสินค้าของโรงเรียนได้สะดวกยิ่งขึ้น รายได้นำไปใช้จัดกิจกรรมของสโมสรนักเรียน และสมทบทุนเพื่อการกุศล"
          right={
            <a
              href="https://www.samoshopth.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground"
            >
              เข้าสู่ SAMO SHOP
            </a>
          }
        />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
          {[
            { t: "เครื่องแบบนักเรียน", d: "ชุดนักเรียน ชุดพละ ชุดว่ายน้ำ และรองเท้า" },
            { t: "อุปกรณ์การเรียน", d: "สมุด ดินสอ ปากกา สีไม้ และอุปกรณ์วิทยาศาสตร์" },
            {
              t: "ของที่ระลึก & พรีเมียม",
              d: "เสื้อยืด กระเป๋าผ้า แก้วน้ำ พวงกุญแจ ออกแบบเฉพาะของโรงเรียน",
            },
            { t: "บัตรกิจกรรม / คูปอง", d: "คูปองและตั๋วงานเทศกาลต่าง ๆ ของโรงเรียน" },
            { t: "สลากการกุศล", d: "ร่วมสนับสนุนกิจกรรมและงานการกุศลของสโมสร" },
          ].map((x) => (
            <div key={x.t} className="bg-background p-6">
              <p className="font-semibold">{x.t}</p>
              <p className="mt-3 text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-px grid gap-px bg-border md:grid-cols-3">
          {[
            {
              t: "สั่งซื้อได้ง่าย เข้าถึงได้ทุกคน",
              d: "นักเรียน ผู้ปกครอง หรือศิษย์เก่า สั่งซื้อออนไลน์ได้จากทุกที่ ทั้งมือถือและคอมพิวเตอร์",
            },
            { t: "ของแท้ มาตรฐานโรงเรียน", d: "สินค้าทุกชิ้นคัดเลือกและดูแลโดยสโมสรนักเรียน" },
            {
              t: "สนับสนุนนักเรียนและกิจกรรม",
              d: "รายได้ส่วนหนึ่งนำไปพัฒนากิจกรรมและสวัสดิการของนักเรียน",
            },
          ].map((x) => (
            <div key={x.t} className="bg-background p-7">
              <p className="eyebrow">{x.t}</p>
              <p className="mt-4 text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-px grid gap-px bg-border md:grid-cols-2">
          <div className="bg-background p-7">
            <p className="eyebrow">การชำระเงิน</p>
            <p className="mt-4 text-sm text-muted-foreground">
              โอนเงินผ่านธนาคาร (Bank Transfer) และ PromptPay
            </p>
          </div>
          <div className="bg-background p-7">
            <p className="eyebrow">การเปลี่ยน / คืนสินค้า</p>
            <p className="mt-4 text-sm text-muted-foreground">
              เปลี่ยนหรือคืนได้ภายใน 7 วันหลังได้รับสินค้า
              กรณีสินค้าชำรุดหรือไม่ตรงตามรายการสั่งซื้อ
            </p>
          </div>
        </div>
      </Section>

      {/* CHANNELS */}
      <Section>
        <SectionHead eyebrow="ช่องทางติดตาม" title="OFFICIAL CHANNELS" />
        <div className="grid gap-px bg-border md:grid-cols-2">
          <a
            href="https://www.facebook.com/sgsamostudentclub/?locale=th_TH"
            target="_blank"
            rel="noreferrer noopener"
            className="bg-background p-7 transition-opacity hover:opacity-70 md:p-10"
          >
            <Tag>Facebook</Tag>
            <h3 className="display-xl mt-5 text-2xl">SG SAMO STUDENT CLUB</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              เพจทางการของสโมสรนักเรียน สำหรับข่าวสาร กิจกรรม และประกาศต่าง ๆ
            </p>
          </a>
          <a
            href="https://www.samoshopth.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="bg-background p-7 transition-opacity hover:opacity-70 md:p-10"
          >
            <Tag>Website</Tag>
            <h3 className="display-xl mt-5 text-2xl">SAMOSHOPTH.COM</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              ร้านค้าออนไลน์ของสโมสรนักเรียน สั่งซื้อ ติดตามสถานะ และดูสินค้าใหม่
            </p>
          </a>
        </div>
      </Section>

      <Section className="bg-secondary">
        <SectionHead
          eyebrow="คณะทำงาน"
          title={`SG MEMBERS · ${membersOf(c, "SG").length} คน`}
          sub={`สมาชิกสโมสรนักเรียนทั้ง ${membersOf(c, "SG").length} คนเป็นคนละกลุ่มกับผู้แทนชุมนุมและผู้แทนห้องเรียน ทุกคนในหน้านี้สังกัดสโมสรนักเรียน`}
        />
        <MemberGrid initial="SG" lock />
      </Section>
    </>
  );
}
