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

/** Static house emblems, keyed by house slug. */
export const EMBLEMS: Record<string, string> = {
  "st-george": george.url,
  "st-gregory": gregory.url,
  "st-louis": louis.url,
  "st-martin": martin.url,
  "st-montfort": montfort.url,
  "st-edmund": edmund.url,
  "st-mary": mary.url,
  "st-dominic": dominic.url,
  "st-francis": francis.url,
};

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

/* ---------------- Types (shared by server + client) ---------------- */

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
  captainRole: string;
  scores: Record<Month, number>;
};

export type MemberOrg = "SG" | "HOUSE" | "CLUB" | "CLASS";

export type Member = {
  id: string;
  name: string;
  role: string;
  org: MemberOrg;
  orgLabel: string;
  klass: string;
  duties: string;
  photoUrl: string;
  projects: string[];
};

export type BoardSeat = {
  id: string;
  role: string;
  fromOrg: string;
  name: string;
  klass: string;
  photoUrl: string;
};

export type Advisor = {
  id: string;
  name: string;
  role: string;
  desc: string;
  photoUrl: string;
};

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

export type News = {
  slug: string;
  title: string;
  cat: "SGSC" | "STUDENT GOVERNMENT" | "HOUSE" | "CLUB" | "PROJECT";
  date: string;
  intro: string;
  body: string[];
  related: string;
  houseSlug?: string | undefined;
  coverUrl?: string | undefined;
};

export type SlotState = "AVAILABLE" | "BOOKED" | "PENDING" | "CLOSED";

export type SiteContent = {
  settings: Record<string, string>;
  currentMonth: Month;
  houses: House[];
  honors: Record<string, { houseOfMonth: string; character: string }>;
  members: Member[];
  congressBoard: BoardSeat[];
  advisoryBoard: Advisor[];
  clubs: Club[];
  projects: Project[];
  news: News[];
  radioSchedule: Record<string, SlotState[]>;
  radioRules: string[];
};

/* ---------------- Static structure ---------------- */

export const ORGS = [
  {
    slug: "student-government",
    name: "STUDENT GOVERNMENT",
    nameTh: "สโมสรนักเรียน",
    desc: "ฝ่ายบริหารของ SGSC 18 คน จากนายกสโมสรนักเรียนถึงกรรมการฝ่าย ดูแลโครงการรวมถึง SG RADIO",
    count: 18,
    to: "/student-government",
  },
  {
    slug: "houses",
    name: "HOUSE OF SAINTS",
    nameTh: "บ้านสายกีฬา",
    desc: "9 ประธานบ้านสายกีฬา ผู้แทนบ้านสายกีฬาทั้ง 9 บ้านในสภา",
    count: 9,
    to: "/houses",
  },
  {
    slug: "clubs",
    name: "CLUBS OF INTEREST",
    nameTh: "ชุมนุมตามความสนใจ",
    desc: "6 ชุมนุม ชุมนุมละ 3 ผู้แทน รวม 18 คนในสภา",
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

export const ORG_FILTERS = [
  { key: "ALL", label: "ทั้งหมด" },
  { key: "SG", label: "สโมสรนักเรียน" },
  { key: "HOUSE", label: "บ้านสายกีฬา" },
  { key: "CLUB", label: "ชุมนุม" },
  { key: "CLASS", label: "ผู้แทนห้อง" },
] as const;

export const RADIO_SLOTS = ["12:00", "12:10", "12:20", "12:30", "12:40"];
export const RADIO_DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
