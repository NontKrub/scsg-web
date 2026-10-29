
import {
  EMBLEMS,
  MONTHS,
  type Month,
  type SiteContent,
} from "@/data/sgsc";

import { getDB } from "./db.server";
import { isRadioMemoryBackend } from "./radio/config";
import { getRadioService } from "./radio/server";

type SettingsRow = {
  key: string;
  value: string;
};

type HouseRow = {
  slug: string;
  no: string;
  name: string;
  name_th: string;
  color_label: string;
  cls: string;
  personality: string;
  intro: string;
  captain: string;
  captain_role: string;
};

type ScoreRow = {
  house_slug: string;
  month: string;
  score: number;
};

type HonorRow = {
  month: string;
  house_of_month: string;
  character_house: string;
};

type MemberRow = {
  id: string;
  name: string;
  role: string;
  org: string;
  org_label: string;
  klass: string;
  duties: string;
  photo_url: string;
};

type BoardRow = {
  id: string;
  role: string;
  from_org: string;
  person_name: string;
  klass: string;
  photo_url: string;
};

type AdvisorRow = {
  id: string;
  person_name: string;
  role: string;
  description: string;
  photo_url: string;
};

type ClubRow = {
  slug: string;
  name: string;
  name_th: string;
  tagline: string;
  about: string;
  cls: string;
  head: string;
  member_count: number;
  activities: string;
};

type NewsRow = {
  slug: string;
  title: string;
  cat: string;
  date_label: string;
  intro: string;
  body: string;
  related: string;
  house_slug: string;
  cover_url: string;
};

// Converts SQLite JSON TEXT into string arrays.
function parseTextArray(
  value: string,
  field: string,
): string[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`Invalid JSON in ${field}`);
  }

  if (
    !Array.isArray(parsed) ||
    !parsed.every((item) => typeof item === "string")
  ) {
    throw new Error(`Invalid string array in ${field}`);
  }

  return parsed as string[];
}

const zeroScores = (): Record<Month, number> =>
  Object.fromEntries(
    MONTHS.map((month) => [month, 0]),
  ) as Record<Month, number>;

export async function loadContent(): Promise<SiteContent> {
  // Preserve the existing isolated test backend.
  if (isRadioMemoryBackend()) {
    return {
      settings: {},
      currentMonth: "AUG",
      houses: [],
      honors: {},
      members: [],
      congressBoard: [],
      advisoryBoard: [],
      clubs: [],
      news: [],
    };
  }

  const db = getDB();

  // Read all public content from D1.
  const [
    { results: settings },
    { results: houses },
    { results: scores },
    { results: honors },
    { results: members },
    { results: board },
    { results: advisors },
    { results: clubs },
    { results: news },
  ] = await Promise.all([
    db.prepare(
      "SELECT key, value FROM site_settings",
    ).all<SettingsRow>(),

    db.prepare(
      "SELECT * FROM houses ORDER BY sort ASC",
    ).all<HouseRow>(),

    db.prepare(
      "SELECT house_slug, month, score FROM house_scores",
    ).all<ScoreRow>(),

    db.prepare(
      "SELECT * FROM honors",
    ).all<HonorRow>(),

    db.prepare(
      "SELECT * FROM members ORDER BY sort ASC",
    ).all<MemberRow>(),

    db.prepare(
      "SELECT * FROM congress_board ORDER BY sort ASC",
    ).all<BoardRow>(),

    db.prepare(
      "SELECT * FROM advisory_board ORDER BY sort ASC",
    ).all<AdvisorRow>(),

    db.prepare(
      "SELECT * FROM clubs ORDER BY sort ASC",
    ).all<ClubRow>(),

    db.prepare(`
      SELECT *
      FROM news
      WHERE published = 1
      ORDER BY created_at DESC
    `).all<NewsRow>(),
  ]);

  // Website settings.
  const settingsMap: Record<string, string> = {};

  for (const row of settings) {
    settingsMap[row.key] = row.value;
  }

  // House scores grouped by house slug.
  const scoreMap = new Map<
    string,
    Record<Month, number>
  >();

  for (const house of houses) {
    scoreMap.set(house.slug, zeroScores());
  }

  for (const row of scores) {
    const record = scoreMap.get(row.house_slug);

    if (
      record &&
      (MONTHS as readonly string[]).includes(row.month)
    ) {
      record[row.month as Month] = Number(row.score);
    }
  }

  const configuredMonth = settingsMap["current_month"];

  const currentMonth: Month =
    configuredMonth &&
    (MONTHS as readonly string[]).includes(configuredMonth)
      ? (configuredMonth as Month)
      : "AUG";

  return {
    settings: settingsMap,
    currentMonth,

    houses: houses.map((house) => ({
      slug: house.slug,
      no: house.no,
      name: house.name,
      nameTh: house.name_th,
      colorLabel: house.color_label,
      cls: house.cls,
      emblem: EMBLEMS[house.slug] ?? "",
      personality: house.personality,
      intro: house.intro,
      captain: house.captain,
      captainRole: house.captain_role,
      scores: scoreMap.get(house.slug) ?? zeroScores(),
    })),

    honors: Object.fromEntries(
      honors.map((row) => [
        row.month,
        {
          houseOfMonth: row.house_of_month,
          character: row.character_house,
        },
      ]),
    ),

    members: members.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      org: member.org as SiteContent["members"][number]["org"],
      orgLabel: member.org_label,
      klass: member.klass,
      duties: member.duties,
      photoUrl: member.photo_url,
    })),

    congressBoard: board.map((row) => ({
      id: row.id,
      role: row.role,
      fromOrg: row.from_org,
      name: row.person_name,
      klass: row.klass,
      photoUrl: row.photo_url,
    })),

    advisoryBoard: advisors.map((row) => ({
      id: row.id,
      name: row.person_name,
      role: row.role,
      desc: row.description,
      photoUrl: row.photo_url,
    })),

    clubs: clubs.map((club) => ({
      slug: club.slug,
      name: club.name,
      nameTh: club.name_th,
      tagline: club.tagline,
      about: club.about,
      cls: club.cls,
      head: club.head,
      members: club.member_count,
      activities: parseTextArray(
        club.activities,
        `clubs.activities (${club.slug})`,
      ),
    })),

    news: news.map((article) => ({
      slug: article.slug,
      title: article.title,
      cat: article.cat as SiteContent["news"][number]["cat"],
      date: article.date_label,
      intro: article.intro,
      body: parseTextArray(
        article.body,
        `news.body (${article.slug})`,
      ),
      related: article.related,
      houseSlug: article.house_slug || undefined,
      coverUrl: article.cover_url || undefined,
    })),
  };
}

// SG Radio will use the D1 repository in Step 66.
export async function loadRadioPage() {
  return getRadioService().getPageData();
}
