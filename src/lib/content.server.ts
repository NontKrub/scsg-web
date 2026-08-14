import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  EMBLEMS,
  MONTHS,
  RADIO_DAYS,
  RADIO_SLOTS,
  type Month,
  type SiteContent,
  type SlotState,
} from "@/data/sgsc";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const zeroScores = () =>
  Object.fromEntries(MONTHS.map((m) => [m, 0])) as Record<Month, number>;

/** Loads the entire public site content from the database. */
export async function loadContent(): Promise<SiteContent> {
  const db = publicClient();

  const [
    settings,
    houses,
    scores,
    honors,
    members,
    board,
    advisors,
    clubs,
    projects,
    updates,
    news,
    slots,
    rules,
  ] = await Promise.all([
    db.from("site_settings").select("key,value"),
    db.from("houses").select("*").order("sort"),
    db.from("house_scores").select("house_slug,month,score"),
    db.from("honors").select("*"),
    db.from("members").select("*").order("sort"),
    db.from("congress_board").select("*").order("sort"),
    db.from("advisory_board").select("*").order("sort"),
    db.from("clubs").select("*").order("sort"),
    db.from("projects").select("*").order("sort"),
    db.from("project_updates").select("*").order("created_at", { ascending: false }),
    db.from("news").select("*").eq("published", true).order("sort").order("created_at", { ascending: false }),
    db.from("radio_slots").select("*"),
    db.from("radio_rules").select("*").order("sort"),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings.data ?? []) settingsMap[s.key] = s.value;

  const scoreMap = new Map<string, Record<Month, number>>();
  for (const h of houses.data ?? []) scoreMap.set(h.slug, zeroScores());
  for (const s of scores.data ?? []) {
    const rec = scoreMap.get(s.house_slug);
    if (rec && (MONTHS as readonly string[]).includes(s.month)) rec[s.month as Month] = Number(s.score);
  }

  const radioSchedule: Record<string, SlotState[]> = {};
  for (const day of RADIO_DAYS) {
    radioSchedule[day] = RADIO_SLOTS.map((slot) => {
      const row = (slots.data ?? []).find((s) => s.day === day && s.slot === slot);
      return (row?.state ?? "AVAILABLE") as SlotState;
    });
  }

  return {
    settings: settingsMap,
    currentMonth: ((MONTHS as readonly string[]).includes(settingsMap["current_month"] ?? "")
      ? settingsMap["current_month"]
      : "AUG") as Month,
    houses: (houses.data ?? []).map((h) => ({
      slug: h.slug,
      no: h.no,
      name: h.name,
      nameTh: h.name_th,
      colorLabel: h.color_label,
      cls: h.cls,
      emblem: EMBLEMS[h.slug] ?? "",
      personality: h.personality,
      intro: h.intro,
      captain: h.captain,
      captainRole: h.captain_role,
      scores: scoreMap.get(h.slug) ?? zeroScores(),
    })),
    honors: Object.fromEntries(
      (honors.data ?? []).map((h) => [
        h.month,
        { houseOfMonth: h.house_of_month, character: h.character_house },
      ]),
    ),
    members: (members.data ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      org: m.org as "SG" | "HOUSE" | "CLUB" | "CLASS",
      orgLabel: m.org_label,
      klass: m.klass,
      duties: m.duties,
      photoUrl: m.photo_url,
      projects: m.projects ?? [],
    })),
    congressBoard: (board.data ?? []).map((b) => ({
      id: b.id,
      role: b.role,
      fromOrg: b.from_org,
      name: b.person_name,
      klass: b.klass,
      photoUrl: b.photo_url,
    })),
    advisoryBoard: (advisors.data ?? []).map((a) => ({
      id: a.id,
      name: a.person_name,
      role: a.role,
      desc: a.description,
      photoUrl: a.photo_url,
    })),
    clubs: (clubs.data ?? []).map((c) => ({
      slug: c.slug,
      name: c.name,
      nameTh: c.name_th,
      tagline: c.tagline,
      about: c.about,
      cls: c.cls,
      head: c.head,
      members: c.member_count,
      activities: c.activities ?? [],
    })),
    projects: (projects.data ?? []).map((p) => ({
      slug: p.slug,
      name: p.name,
      org: p.org,
      status: p.status as "ACTIVE" | "UPCOMING" | "COMPLETED",
      owner: p.owner,
      desc: p.description,
      cta: p.cta,
      to: p.link,
      start: p.start_label,
      end: p.end_label,
      updates: (updates.data ?? [])
        .filter((u) => u.project_slug === p.slug)
        .map((u) => ({ date: u.date_label, text: u.text })),
    })),
    news: (news.data ?? []).map((n) => ({
      slug: n.slug,
      title: n.title,
      cat: n.cat as "SGSC" | "STUDENT GOVERNMENT" | "HOUSE" | "CLUB" | "PROJECT",
      date: n.date_label,
      intro: n.intro,
      body: n.body ?? [],
      related: n.related,
      houseSlug: n.house_slug || undefined,
      coverUrl: n.cover_url || undefined,
    })),
    radioSchedule,
    radioRules: (rules.data ?? []).map((r) => r.text),
  };
}
