import { defineMcp, type AnyToolDefinition } from "@lovable.dev/mcp-js";
import getOrganizationTool from "./tools/get-organization";
import listMembersTool from "./tools/list-members";
import listHousesTool from "./tools/list-houses";
import getHouseScoresTool from "./tools/get-house-scores";
import listClubsTool from "./tools/list-clubs";
import listProjectsTool from "./tools/list-projects";
import listNewsTool from "./tools/list-news";
import getRadioScheduleTool from "./tools/get-radio-schedule";

export default defineMcp({
  name: "saint-gabriel-s-congress",
  title: "Saint Gabriel's Congress",
  version: "0.1.0",
  instructions:
    "Public tools for SGSC (Student Congress of Saint Gabriel's College / สภานักเรียนโรงเรียนเซนต์คาเบรียล). Use get_organization for the congress structure, list_members for the 68 members, list_houses and get_house_scores for the 9 sports houses (บ้านสายกีฬา) and House Competition standings, list_clubs for the 6 interest clubs (ชุมนุม), list_projects and list_news for activity, and get_radio_schedule for SG Radio. All content is Thai-first public website data.",
  tools: [
    getOrganizationTool,
    listMembersTool,
    listHousesTool,
    getHouseScoresTool,
    listClubsTool,
    listProjectsTool,
    listNewsTool,
    getRadioScheduleTool,
  ],
});
