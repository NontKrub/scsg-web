import { auth, defineMcp } from "@lovable.dev/mcp-js";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";


type McpTools = Parameters<typeof defineMcp>[0]["tools"];
import getOrganizationTool from "./tools/get-organization";
import listMembersTool from "./tools/list-members";
import listHousesTool from "./tools/list-houses";
import getHouseScoresTool from "./tools/get-house-scores";
import listClubsTool from "./tools/list-clubs";
import listNewsTool from "./tools/list-news";
import getRadioScheduleTool from "./tools/get-radio-schedule";

export default defineMcp({
  name: "saint-gabriel-s-congress",
  title: "Saint Gabriel's Congress",
  version: "0.1.0",
  instructions:
    "Tools for SGSC (Student Congress of Saint Gabriel's College / สภานักเรียนโรงเรียนเซนต์คาเบรียล). Callers must sign in to this app. Use get_organization for the congress structure, list_members for the 68 members, list_houses and get_house_scores for the 9 sports houses (บ้านสายกีฬา) and House Competition standings, list_clubs for the 6 interest clubs (ชุมนุม), list_news for announcements, and get_radio_schedule for SG Radio.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [

    getOrganizationTool,
    listMembersTool,
    listHousesTool,
    getHouseScoresTool,
    listClubsTool,
    listNewsTool,
    getRadioScheduleTool,
  ] as unknown as McpTools,
});

