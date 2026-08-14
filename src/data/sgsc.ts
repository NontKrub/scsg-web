import george from "@/assets/george.asset.json";
import gregory from "@/assets/gregory.asset.json";
import louis from "@/assets/louis.asset.json";
import martin from "@/assets/martin.asset.json";
import montfort from "@/assets/montfort.asset.json";
import edmund from "@/assets/edmund.asset.json";
import mary from "@/assets/mary.asset.json";
import dominic from "@/assets/dominic.asset.json";
import francis from "@/assets/francis.asset.json";
import logo from "@/assets/sgsc-logo.png";

export const SGSC_LOGO = logo;

export const MONTHS = ["JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;
export type Month = (typeof MONTHS)[number];

export const MONTH_TH: Record<Month, string> = {
  JUN: "มิถุนายน",
  JUL: "กรกฎาคม",
  AUG: "สิงหาคม",
  SEP: "กันยายน",
  OCT: "ตุลาคม",
  NOV: "พฤศจิกายน",
  DEC: "ธันวาคม",
};

export const TIERS = [
  { min: 95, name: "BEACON HOUSE", th: "บ้านประภาคาร" },
  { min: 90, name: "THRIVING HOUSE", th: "บ้านเติบโตแข็งแรง" },
  { min: 85, name: "FLOURISHING HOUSE", th: "บ้านผลิบาน" },
  { min: 80, name: "GROWING HOUSE", th: "บ้านกำลังเติบโต" },
  { min: 0, name: "SEEDS HOUSE", th: "บ้านเมล็ดพันธุ์" },
];

export function tierOf(score: number) {
  return TIERS.find((t) => score >= t.min)!;
}

export type House = {
  slug: string;
  no: string;
  name: string;
  nameTh: string;
  colorLabel: string;
  cls: string;
  emblem: string;
  personality: string;
  intro: string;
  captain: string;
  scores: Record<Month, number>;
};

const S = (v: number[]): Record<Month, number> =>
  Object.fromEntries(MONTHS.map((m, i) => [m, v[i]!])) as Record<Month, number>;

export const HOUSES: House[] = [
  {
    slug: "st-george",
    no: "01",
    name: "ST. GEORGE",
    nameTh: "เซนต์จอร์จ",
    colorLabel: "เหลือง",
    cls: "house-george",
    emblem: george.url,
    personality: "กล้าหาญ ทรงพลัง เรขาคณิตชัดเจน",
    intro: "บ้านแห่งความกล้าหาญและพลังงาน สัญลักษณ์นกอินทรีทองบนพื้นเหลือง",
    captain: "ธนกฤต วโรดมชัย",
    scores: S([88.2, 90.4, 92.1, 91.6, 93.0, 93.8, 94.2]),
  },
  {
    slug: "st-gregory",
    no: "02",
    name: "ST. GREGORY",
    nameTh: "เซนต์เกรโกรี",
    colorLabel: "แดง",
    cls: "house-gregory",
    emblem: gregory.url,
    personality: "เป็นทางการ เรียบคม ตัวอักษรเด่น",
    intro: "บ้านแห่งระเบียบวินัยและความมุ่งมั่น ม้าทองบนพื้นแดง",
    captain: "ปุณณวิช ศรีสกุล",
    scores: S([84.5, 86.0, 88.7, 89.4, 90.2, 90.9, 91.5]),
  },
  {
    slug: "st-louis",
    no: "03",
    name: "ST. LOUIS",
    nameTh: "เซนต์หลุยส์",
    colorLabel: "เขียว",
    cls: "house-louis",
    emblem: louis.url,
    personality: "สะอาด สดใหม่ มีโครงสร้าง",
    intro: "บ้านแห่งความสงบและความแม่นยำ เสือดาวทองบนพื้นเขียว",
    captain: "กันตพัฒน์ อริยะกุล",
    scores: S([86.1, 87.3, 89.9, 90.5, 91.1, 91.4, 92.0]),
  },
  {
    slug: "st-martin",
    no: "04",
    name: "ST. MARTIN",
    nameTh: "เซนต์มาร์ติน",
    colorLabel: "น้ำเงิน",
    cls: "house-martin",
    emblem: martin.url,
    personality: "ทันสมัย แม่นยำ เชิงเทคนิค",
    intro: "บ้านแห่งความเป็นผู้นำและความละเอียด นักรบเงินบนพื้นน้ำเงิน",
    captain: "ณภัทร เตชะวงศ์",
    scores: S([91.0, 93.5, 96.2, 95.4, 96.0, 96.6, 97.1]),
  },
  {
    slug: "st-montfort",
    no: "05",
    name: "ST. MONTFORT",
    nameTh: "เซนต์มงฟอร์ต",
    colorLabel: "ชมพู",
    cls: "house-montfort",
    emblem: montfort.url,
    personality: "สง่างาม แสดงออก อ่อนโยนแบบนิตยสาร",
    intro: "บ้านแห่งความสร้างสรรค์และมิตรภาพ เหยี่ยวทองบนพื้นชมพู",
    captain: "ภูริช จันทรวงศ์",
    scores: S([82.4, 84.9, 86.8, 87.9, 88.5, 89.2, 90.0]),
  },
  {
    slug: "st-edmund",
    no: "06",
    name: "ST. EDMUND",
    nameTh: "เซนต์เอ็ดมันด์",
    colorLabel: "ม่วง",
    cls: "house-edmund",
    emblem: edmund.url,
    personality: "พรีเมียม เข้ม เป็นพิธีการ",
    intro: "บ้านแห่งเกียรติยศและความสง่า สิงโตทองบนพื้นม่วง",
    captain: "ศุภกร ธนพัฒน์",
    scores: S([89.6, 92.2, 94.8, 94.1, 94.6, 95.2, 95.8]),
  },
  {
    slug: "st-mary",
    no: "07",
    name: "ST. MARY",
    nameTh: "เซนต์แมรี",
    colorLabel: "ส้ม",
    cls: "house-mary",
    emblem: mary.url,
    personality: "อบอุ่น มีพลัง เป็นมิตร",
    intro: "บ้านแห่งความอบอุ่นและการช่วยเหลือ สิงโตมีปีกบนพื้นส้ม",
    captain: "อชิรวิชญ์ พงษ์ไพศาล",
    scores: S([83.0, 85.6, 87.4, 88.0, 88.9, 89.6, 90.4]),
  },
  {
    slug: "st-dominic",
    no: "08",
    name: "ST. DOMINIC",
    nameTh: "เซนต์ดอมินิก",
    colorLabel: "น้ำตาล",
    cls: "house-dominic",
    emblem: dominic.url,
    personality: "มรดก ดั้งเดิม จดหมายเหตุ",
    intro: "บ้านแห่งประเพณีและสันติ นกพิราบขาวบนพื้นน้ำตาล",
    captain: "รัชพล อินทโชติ",
    scores: S([80.8, 82.7, 85.1, 86.3, 87.0, 87.8, 88.6]),
  },
  {
    slug: "st-francis",
    no: "09",
    name: "ST. FRANCIS",
    nameTh: "เซนต์ฟรังซิส",
    colorLabel: "เทา",
    cls: "house-francis",
    emblem: francis.url,
    personality: "มินิมอล สถาปัตย์ โมโนโครม",
    intro: "บ้านแห่งความเงียบและความเฉียบคม ฉลามเงินบนพื้นเทา",
    captain: "ธีร์ วีรกุลชัย",
    scores: S([78.2, 82.0, 86.6, 87.2, 88.1, 88.7, 89.3]),
  },
];

export const CURRENT_MONTH: Month = "AUG";

export function ranking(month: Month) {
  return [...HOUSES]
    .sort((a, b) => b.scores[month] - a.scores[month])
    .map((h, i) => ({ house: h, rank: i + 1, score: h.scores[month] }));
}

export function rankOf(slug: string, month: Month) {
  return ranking(month).find((r) => r.house.slug === slug)!.rank;
}

export function growth(slug: string, month: Month) {
  const h = HOUSES.find((x) => x.slug === slug)!;
  const i = MONTHS.indexOf(month);
  if (i <= 0) return 0;
  return +(h.scores[month] - h.scores[MONTHS[i - 1]!]).toFixed(1);
}

export const HONORS: Record<Month, { houseOfMonth: string; character: string }> = {
  JUN: { houseOfMonth: "st-martin", character: "st-dominic" },
  JUL: { houseOfMonth: "st-martin", character: "st-francis" },
  AUG: { houseOfMonth: "st-martin", character: "st-francis" },
  SEP: { houseOfMonth: "st-edmund", character: "st-montfort" },
  OCT: { houseOfMonth: "st-martin", character: "st-mary" },
  NOV: { houseOfMonth: "st-martin", character: "st-george" },
  DEC: { houseOfMonth: "st-martin", character: "st-louis" },
};

/* ---------------- Organizations ---------------- */

export const ORGS = [
  {
    slug: "student-government",
    name: "STUDENT GOVERNMENT",
    nameTh: "สภานักเรียน",
    desc: "ฝ่ายบริหารของ SGSC 18 คน จากนายกสภานักเรียนถึงกรรมการฝ่าย ดูแลโครงการรวมถึง SG RADIO",
    count: 18,
    to: "/student-government",
  },
  {
    slug: "houses",
    name: "HOUSE OF SAINTS",
    nameTh: "บ้านสายกีฬา",
    desc: "9 ประธานบ้านนักบุญ ผู้แทนบ้านสายกีฬาทั้ง 9 บ้านในสภา",
    count: 9,
    to: "/houses",
  },
  {
    slug: "clubs",
    name: "CLUBS OF INTEREST",
    nameTh: "ชมรมตามความสนใจ",
    desc: "6 ชมรม ชมรมละ 3 ผู้แทน รวม 18 คนในสภา",
    count: 18,
    to: "/clubs",
  },
  {
    slug: "class-representatives",
    name: "CLASS REPRESENTATIVES",
    nameTh: "ผู้แทนห้องเรียน",
    desc: "ผู้แทนห้องเรียน 23 คน ส่งเสียงของเพื่อนร่วมห้องถึงสภา",
    count: 23,
    to: "/members",
  },
] as const;

/* ---------------- Clubs ---------------- */

export type Club = {
  slug: string;
  name: string;
  nameTh: string;
  tagline: string;
  about: string;
  cls: string;
  head: string;
  members: number;
  activities: string[];
};

export const CLUBS: Club[] = [
  {
    slug: "asa-saint",
    name: "ASA SAINT",
    nameTh: "อาสาเซนต์",
    tagline: "ลงมือทำเพื่อคนอื่น",
    about: "ชมรมจิตอาสาของโรงเรียน จัดกิจกรรมบำเพ็ญประโยชน์ทั้งในและนอกรั้วโรงเรียน",
    cls: "house-mary",
    head: "ปกรณ์ สุวรรณเลิศ",
    members: 42,
    activities: ["ค่ายอาสาพัฒนาโรงเรียน", "บริจาคโลหิต", "ตลาดนัดของมือสอง"],
  },
  {
    slug: "interact",
    name: "INTERACT",
    nameTh: "อินเทอร์แรค",
    tagline: "ชุมชนและการบริการ",
    about: "ชมรมภายใต้โรตารี เน้นงานบริการชุมชนและการเป็นผู้นำเยาวชน",
    cls: "house-louis",
    head: "กฤตเมธ ชัยวัฒน์",
    members: 38,
    activities: ["โครงการห้องสมุดเคลื่อนที่", "Interact District Conference", "Workshop ผู้นำ"],
  },
  {
    slug: "innovation",
    name: "INNOVATION",
    nameTh: "นวัตกรรม",
    tagline: "สร้างสิ่งที่ยังไม่มี",
    about: "ชมรมเทคโนโลยีและนวัตกรรม หุ่นยนต์ โค้ดดิ้ง และการประกวดสิ่งประดิษฐ์",
    cls: "house-martin",
    head: "ณัฐดนัย ภูมิพัฒน์",
    members: 35,
    activities: ["Robotics Challenge", "Hackathon ภายใน", "STEM Camp"],
  },
  {
    slug: "mc",
    name: "MC",
    nameTh: "พิธีกร",
    tagline: "เสียงของทุกเวที",
    about: "ชมรมพิธีกรและการแสดง ฝึกการพูดในที่สาธารณะและการดำเนินรายการ",
    cls: "house-gregory",
    head: "พชรพล เกียรติวงศ์",
    members: 24,
    activities: ["อบรมพิธีกรรุ่นใหม่", "ดำเนินรายการงานโรงเรียน", "ร่วมงาน SG Radio"],
  },
  {
    slug: "board-game",
    name: "BOARD GAME",
    nameTh: "บอร์ดเกม",
    tagline: "คิด เล่น วางแผน",
    about: "ชมรมบอร์ดเกม พื้นที่พักผ่อนและฝึกการคิดเชิงกลยุทธ์ช่วงพักกลางวัน",
    cls: "house-edmund",
    head: "ธนภัทร วิศิษฏ์",
    members: 46,
    activities: ["Board Game Day", "ทัวร์นาเมนต์หมากล้อม", "ห้องเกมพักกลางวัน"],
  },
  {
    slug: "public-relation",
    name: "PUBLIC RELATION",
    nameTh: "ประชาสัมพันธ์",
    tagline: "เล่าเรื่องของเซนต์คาเบรียล",
    about: "ชมรมสื่อสารองค์กร ดูแลภาพถ่าย วิดีโอ และช่องทางออนไลน์ของ SGSC",
    cls: "house-montfort",
    head: "ชยพล ธีรกานต์",
    members: 29,
    activities: ["ทีมภาพนิ่งงานโรงเรียน", "ผลิตคอนเทนต์ SGSC", "อบรมการถ่ายภาพ"],
  },
];

/* ---------------- Members ---------------- */

export type Member = {
  id: string;
  name: string;
  role: string;
  org: "SG" | "HOUSE" | "CLUB" | "CLASS";
  orgLabel: string;
  klass: string;
  duties: string;
  projects: string[];
};

const FIRST = [
  "ธนกฤต","ปุณณวิช","กันตพัฒน์","ณภัทร","ภูริช","ศุภกร","อชิรวิชญ์","รัชพล","ธีร์","ปกรณ์",
  "กฤตเมธ","ณัฐดนัย","พชรพล","ธนภัทร","ชยพล","วรินทร","ภาณุวิชญ์","กิตติภพ","สรวิชญ์","พีรวิชญ์",
  "อติวิชญ์","ชนาธิป","ธรรมรัตน์","จิรายุ","ปัณณธร","นราวิชญ์","ศิวกร","ภัทรพล","กันต์","ธนดล",
  "วีรภัทร","อริยะ","พิชญุตม์","ภูมิรพี","คุณานนต์",
];
const LAST = [
  "วโรดมชัย","ศรีสกุล","อริยะกุล","เตชะวงศ์","จันทรวงศ์","ธนพัฒน์","พงษ์ไพศาล","อินทโชติ","วีรกุลชัย","สุวรรณเลิศ",
  "ชัยวัฒน์","ภูมิพัฒน์","เกียรติวงศ์","วิศิษฏ์","ธีรกานต์","บุษบงษ์","รัตนพงศ์","สิริวัฒน์","กิจเจริญ","ทองสุข",
];

function name(i: number) {
  return `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`;
}

const SG_ROLES = [
  "นายกสภานักเรียน","รองนายกคนที่ 1","รองนายกคนที่ 2","เหรัญญิกสภานักเรียน","เลขานุการสภานักเรียน",
  "หัวหน้าฝ่ายกิจกรรม","หัวหน้าฝ่ายวิชาการ","หัวหน้าฝ่ายสื่อสาร","หัวหน้าฝ่ายกีฬา","หัวหน้าฝ่ายอาสา",
  "กรรมการฝ่ายกิจกรรม","กรรมการฝ่ายวิชาการ","กรรมการฝ่ายสื่อสาร","กรรมการฝ่ายกีฬา","กรรมการฝ่ายอาสา",
  "กรรมการฝ่ายสวัสดิการ","กรรมการฝ่ายเทคโนโลยี","กรรมการฝ่ายประสานงาน",
];

const KLASS = ["ม.6/1", "ม.6/2", "ม.5/1", "ม.5/2", "ม.5/3", "ม.4/1", "ม.4/2"];

const members: Member[] = [];
let idc = 0;
const push = (m: Omit<Member, "id">) => members.push({ id: `m${++idc}`, ...m });

SG_ROLES.forEach((role, i) =>
  push({
    name: name(i),
    role,
    org: "SG",
    orgLabel: "สภานักเรียน",
    klass: KLASS[i % KLASS.length]!,
    duties: "ดูแลการดำเนินงานของสภานักเรียนตามฝ่ายที่รับผิดชอบ ประสานงานกับองค์กรอื่นใน SGSC",
    projects: i < 6 ? ["SG RADIO", "SAINT MARKET"] : ["SAINT MARKET"],
  }),
);

HOUSES.forEach((h, hi) => {
  ["ประธานบ้าน"].forEach((role, ri) =>
    push({
      name: ri === 0 ? h.captain : name(hi * 3 + ri + 5),
      role,
      org: "HOUSE",
      orgLabel: h.name,
      klass: KLASS[(hi + ri) % KLASS.length]!,
      duties: `ดูแลกิจกรรมและคะแนนของบ้าน ${h.nameTh} ประสานงานกับคณะกรรมการ House of Saints`,
      projects: ["HOUSE COMPETITION"],
    }),
  );
});

CLUBS.forEach((c, ci) =>
  ["ประธานชมรม", "รองประธานชมรม", "เลขานุการชมรม"].forEach((role, ri) =>
    push({
      name: ri === 0 ? c.head : name(ci * 3 + ri + 12),
      role,
      org: "CLUB",
      orgLabel: c.name,
      klass: KLASS[(ci + ri) % KLASS.length]!,
      duties: `บริหารกิจกรรมของชมรม ${c.nameTh} และเป็นผู้แทนชมรมในสภา SGSC`,
      projects: [c.activities[0]!],
    }),
  ),
);

export const CLASS_LEVELS = ["M1", "M2", "M3", "M4", "M5", "M6"] as const;
export const CLASS_ROOMS: { level: string; room: string; rep: string }[] = [];
CLASS_LEVELS.forEach((lv, li) => {
  const rooms = li === CLASS_LEVELS.length - 1 ? 3 : 4;
  for (let r = 1; r <= rooms; r++) {
    const rep = name(li * 3 + r + 20);
    CLASS_ROOMS.push({ level: lv, room: `${lv.replace("M", "ม.")}/${r}`, rep });
  }
});
CLASS_ROOMS.forEach((c, i) =>
  push({
    name: c.rep,
    role: `ผู้แทนห้อง ${c.room}`,
    org: "CLASS",
    orgLabel: "ผู้แทนห้องเรียน",
    klass: c.room,
    duties: "รวบรวมความคิดเห็นของเพื่อนร่วมห้องและนำเสนอต่อสภานักเรียน",
    projects: i % 2 === 0 ? ["VOICE BOX"] : [],
  }),
);

export const MEMBERS = members;
export const TOTAL_MEMBERS = members.length;

/* --- Student Government executive (18 คน อยู่ภายใต้สภานักเรียนใหญ่) --- */
export const SG_MEMBERS = members.filter((m) => m.org === "SG");
export const SG_TOTAL = SG_MEMBERS.length;

/* --- คณะกรรมการบริหารสภา 5 ตำแหน่ง (เลือกจากสมาชิกสภา 68 คน) --- */
export const CONGRESS_BOARD = [
  { role: "ประธานสภานักเรียน", from: "สภานักเรียน", member: members[0]! },
  { role: "รองประธานสภา คนที่ 1", from: "คณะสีนักบุญ", member: members[18]! },
  { role: "รองประธานสภา คนที่ 2", from: "ชมรมตามความสนใจ", member: members[45]! },
  { role: "เลขาธิการสภา", from: "สภานักเรียน", member: members[4]! },
  { role: "เหรัญญิกสภา", from: "ผู้แทนห้องเรียน", member: members[57]! },
];

/* --- คณะที่ปรึกษาสภา (ไม่นับรวมในสมาชิก 68 คน) --- */
export const ADVISORY_BOARD = [
  {
    name: "ภราดาผู้อำนวยการ",
    role: "ประธานที่ปรึกษา",
    desc: "ให้แนวทางเชิงนโยบายและอนุมัติโครงการระดับโรงเรียน",
  },
  {
    name: "หัวหน้าฝ่ายกิจการนักเรียน",
    role: "ที่ปรึกษาอาวุโส",
    desc: "กำกับดูแลการทำงานของสภานักเรียนและองค์กรทั้งสี่",
  },
  {
    name: "ครูที่ปรึกษาคณะสีนักบุญ",
    role: "ที่ปรึกษา House of Saints",
    desc: "ดูแลระบบคะแนน House Competition และกิจกรรมคณะสี",
  },
  {
    name: "ครูที่ปรึกษาชมรม",
    role: "ที่ปรึกษา Clubs of Interest",
    desc: "สนับสนุนการจัดตั้งและดำเนินกิจกรรมของชมรมทั้ง 6 ชมรม",
  },
  {
    name: "ครูที่ปรึกษาฝ่ายสื่อสาร",
    role: "ที่ปรึกษาโครงการสื่อ",
    desc: "ให้คำแนะนำงานประชาสัมพันธ์และโครงการ SG Radio ของสภานักเรียน",
  },
];

export const ORG_FILTERS = [
  { key: "ALL", label: "ทั้งหมด" },
  { key: "SG", label: "สภานักเรียน" },
  { key: "HOUSE", label: "คณะสีนักบุญ" },
  { key: "CLUB", label: "ชมรม" },
  { key: "CLASS", label: "ผู้แทนห้อง" },
] as const;

/* ---------------- Projects ---------------- */

export type Project = {
  slug: string;
  name: string;
  org: string;
  status: "ACTIVE" | "UPCOMING" | "COMPLETED";
  owner: string;
  desc: string;
  cta: string;
  to: string;
  start: string;
  end: string;
  updates: { date: string; text: string }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "sg-radio",
    name: "SG RADIO",
    org: "สภานักเรียน",
    status: "ACTIVE",
    owner: "ฝ่ายสื่อสาร สภานักเรียน",
    desc: "เสียงตามสายช่วงพักกลางวัน เปิดให้นักเรียนจองคิวขอเพลงและส่งข้อความถึงเพื่อน",
    cta: "จองคิว SG RADIO",
    to: "/radio",
    start: "01 มิ.ย. 2026",
    end: "ต่อเนื่อง",
    updates: [
      { date: "12 ส.ค. 2026", text: "เปิดรอบจองเดือนกันยายนแล้ว" },
      { date: "02 ส.ค. 2026", text: "เพิ่มช่วงเวลา 12:40 น. ทุกวันศุกร์" },
    ],
  },
  {
    slug: "saint-market",
    name: "SAINT MARKET",
    org: "สภานักเรียน",
    status: "UPCOMING",
    owner: "ฝ่ายกิจกรรม สภานักเรียน",
    desc: "ตลาดนัดนักเรียนประจำภาคเรียน เปิดพื้นที่ให้ทุกห้องเปิดร้านของตัวเอง",
    cta: "ดูรายละเอียด",
    to: "/projects/saint-market",
    start: "15 ก.ย. 2026",
    end: "17 ก.ย. 2026",
    updates: [{ date: "08 ส.ค. 2026", text: "เปิดรับสมัครร้านค้าจากทุกระดับชั้น" }],
  },
  {
    slug: "voice-box",
    name: "VOICE BOX",
    org: "ผู้แทนห้องเรียน",
    status: "ACTIVE",
    owner: "คณะผู้แทนห้องเรียน",
    desc: "ช่องทางรับความคิดเห็นจากนักเรียนทุกห้อง สรุปและส่งต่อถึงฝ่ายบริหารทุกเดือน",
    cta: "ดูรายละเอียด",
    to: "/projects/voice-box",
    start: "20 มิ.ย. 2026",
    end: "ต่อเนื่อง",
    updates: [{ date: "30 ก.ค. 2026", text: "สรุปข้อเสนอเดือนกรกฎาคม 42 เรื่อง" }],
  },
  {
    slug: "house-competition",
    name: "HOUSE COMPETITION",
    org: "คณะสีนักบุญ",
    status: "ACTIVE",
    owner: "คณะกรรมการ House of Saints",
    desc: "การแข่งขันสะสมคะแนนประจำเดือนของทั้ง 9 บ้าน วัดผลด้านวินัย กิจกรรม และจิตอาสา",
    cta: "ดูคะแนน",
    to: "/competition",
    start: "01 มิ.ย. 2026",
    end: "31 ธ.ค. 2026",
    updates: [{ date: "12 ส.ค. 2026", text: "ประกาศผลคะแนนเดือนสิงหาคมแล้ว" }],
  },
  {
    slug: "green-saint",
    name: "GREEN SAINT",
    org: "ชมรมอาสาเซนต์",
    status: "COMPLETED",
    owner: "ชมรม ASA Saint",
    desc: "โครงการแยกขยะและลดพลาสติกในโรงเรียน ร่วมกับทุกบ้านนักบุญ",
    cta: "ดูรายละเอียด",
    to: "/projects/green-saint",
    start: "10 มิ.ย. 2026",
    end: "31 ก.ค. 2026",
    updates: [{ date: "31 ก.ค. 2026", text: "ลดขยะพลาสติกได้ 38% ตลอดโครงการ" }],
  },
];

/* ---------------- News ---------------- */

export type News = {
  slug: string;
  title: string;
  cat: "SGSC" | "STUDENT GOVERNMENT" | "HOUSE" | "CLUB" | "PROJECT";
  date: string;
  intro: string;
  body: string[];
  related: string;
  houseSlug?: string;
};

export const NEWS: News[] = [
  {
    slug: "august-house-results",
    title: "ประกาศผลคะแนน House Competition เดือนสิงหาคม",
    cat: "HOUSE",
    date: "12 ส.ค. 2026",
    intro: "ST. MARTIN ขึ้นนำด้วยคะแนน 96.2% และคว้าตำแหน่ง House of the Month",
    body: [
      "คณะกรรมการ House of Saints ประกาศผลคะแนนประจำเดือนสิงหาคม 2026 อย่างเป็นทางการ",
      "ST. MARTIN ทำคะแนนสูงสุดที่ 96.2% เข้าสู่ระดับ BEACON HOUSE ตามด้วย ST. EDMUND และ ST. GEORGE",
      "ST. FRANCIS เป็นบ้านที่พัฒนาขึ้นมากที่สุดในเดือนนี้ด้วยการเพิ่มขึ้น 4.6%",
    ],
    related: "House of Saints",
    houseSlug: "st-martin",
  },
  {
    slug: "sg-radio-open",
    title: "SG RADIO เปิดจองคิวรอบเดือนกันยายน",
    cat: "PROJECT",
    date: "10 ส.ค. 2026",
    intro: "นักเรียนทุกระดับชั้นสามารถจองช่วงเวลาเสียงตามสายพักกลางวันได้แล้ว",
    body: [
      "โครงการ SG RADIO เปิดรับการจองคิวรอบเดือนกันยายน ผ่านระบบจองออนไลน์ของเว็บไซต์ SGSC",
      "แต่ละช่วงเวลามีความยาว 10 นาที เริ่มตั้งแต่ 12:00 น. ถึง 12:40 น. ในวันจันทร์ถึงศุกร์",
    ],
    related: "สภานักเรียน",
  },
  {
    slug: "congress-opening",
    title: "พิธีเปิดสภานักเรียนคณะที่ 69 อย่างเป็นทางการ",
    cat: "SGSC",
    date: "05 ส.ค. 2026",
    intro: "68 ผู้นำนักเรียนจาก 4 องค์กร ร่วมกล่าวคำปฏิญาณต่อหน้าคณะผู้บริหาร",
    body: [
      "พิธีเปิดสภานักเรียนจัดขึ้น ณ หอประชุมใหญ่ โดยมีตัวแทนจากทั้ง 4 องค์กรเข้าร่วม",
      "ประธานสภานักเรียนกล่าวถึงทิศทางการทำงานของปีนี้ที่เน้นความโปร่งใสและการมีส่วนร่วม",
    ],
    related: "SGSC",
  },
  {
    slug: "innovation-robotics",
    title: "ชมรม Innovation คว้ารางวัลรองชนะเลิศ Robotics Challenge",
    cat: "CLUB",
    date: "01 ส.ค. 2026",
    intro: "ทีมหุ่นยนต์ของโรงเรียนสร้างผลงานในเวทีระดับภูมิภาค",
    body: ["ทีมนักเรียนจากชมรม Innovation ส่งหุ่นยนต์เข้าแข่งขันและได้รับรางวัลรองชนะเลิศอันดับ 1"],
    related: "Clubs of Interest",
  },
  {
    slug: "saint-market-call",
    title: "SAINT MARKET เปิดรับสมัครร้านค้าจากทุกห้องเรียน",
    cat: "STUDENT GOVERNMENT",
    date: "28 ก.ค. 2026",
    intro: "ตลาดนัดนักเรียนประจำภาคเรียนจะจัดขึ้นกลางเดือนกันยายน",
    body: ["ฝ่ายกิจกรรมสภานักเรียนเปิดรับสมัครร้านค้าตั้งแต่วันนี้ถึง 25 สิงหาคม"],
    related: "สภานักเรียน",
  },
  {
    slug: "edmund-ceremony",
    title: "ST. EDMUND จัดพิธีมอบเข็มเกียรติยศประจำบ้าน",
    cat: "HOUSE",
    date: "22 ก.ค. 2026",
    intro: "บ้านม่วงจัดพิธีการเข้มขลังเพื่อยกย่องสมาชิกดีเด่นประจำเดือน",
    body: ["คณะกรรมการบ้าน ST. EDMUND จัดพิธีมอบเข็มให้สมาชิก 12 คน"],
    related: "House of Saints",
    houseSlug: "st-edmund",
  },
];

/* ---------------- SG Radio ---------------- */

export const RADIO_SLOTS = ["12:00", "12:10", "12:20", "12:30", "12:40"];
export const RADIO_DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];

export type SlotState = "AVAILABLE" | "BOOKED" | "PENDING" | "CLOSED";

export const RADIO_SCHEDULE: Record<string, SlotState[]> = {
  จันทร์: ["BOOKED", "AVAILABLE", "BOOKED", "AVAILABLE", "CLOSED"],
  อังคาร: ["BOOKED", "BOOKED", "AVAILABLE", "PENDING", "AVAILABLE"],
  พุธ: ["AVAILABLE", "AVAILABLE", "BOOKED", "AVAILABLE", "CLOSED"],
  พฤหัสบดี: ["BOOKED", "PENDING", "AVAILABLE", "BOOKED", "AVAILABLE"],
  ศุกร์: ["BOOKED", "BOOKED", "BOOKED", "AVAILABLE", "AVAILABLE"],
};

export const RADIO_RULES = [
  "เพลงและข้อความต้องเหมาะสมกับบริบทโรงเรียน",
  "หนึ่งนักเรียนจองได้ 1 ช่วงเวลาต่อสัปดาห์",
  "ส่งคำขอล่วงหน้าอย่างน้อย 2 วันทำการ",
  "ทีมงานขอสงวนสิทธิ์ในการปฏิเสธเนื้อหาที่ไม่เหมาะสม",
  "มาถึงห้องส่งก่อนเวลาออกอากาศ 5 นาที",
];

export const AUDIT_LOG = [
  { time: "12 ส.ค. 2026 — 21:02", action: "อนุมัติการจอง SG Radio ช่วง 12:20", by: "Radio Admin" },
  { time: "12 ส.ค. 2026 — 20:51", action: "เผยแพร่ผลคะแนนบ้านเดือนสิงหาคม", by: "President" },
  { time: "12 ส.ค. 2026 — 20:42", action: "แก้ไขคะแนนบ้านเดือนสิงหาคม", by: "Secretary" },
  { time: "11 ส.ค. 2026 — 18:20", action: "เพิ่มข่าว: พิธีเปิดสภานักเรียนคณะที่ 69", by: "Content Editor" },
  { time: "10 ส.ค. 2026 — 09:15", action: "ปิดช่วงเวลา 12:40 วันจันทร์", by: "Radio Admin" },
];

export const ADMIN_ROLES = [
  { role: "SUPER ADMIN", desc: "จัดการได้ทุกส่วนของระบบ", people: 2 },
  { role: "EXECUTIVE ADMIN", desc: "จัดการเนื้อหา SGSC เกือบทั้งหมด", people: 4 },
  { role: "HOUSE ADMIN", desc: "จัดการเฉพาะหน้าบ้านของตน แก้คะแนนทางการไม่ได้", people: 9 },
  { role: "CLUB ADMIN", desc: "จัดการเฉพาะชมรมของตน", people: 6 },
  { role: "PROJECT ADMIN", desc: "จัดการโครงการที่ได้รับมอบหมาย", people: 5 },
  { role: "RADIO ADMIN", desc: "จัดการระบบ SG Radio ทั้งหมด", people: 3 },
  { role: "CONTENT EDITOR", desc: "จัดการข่าวและคลังสื่อ", people: 4 },
];
