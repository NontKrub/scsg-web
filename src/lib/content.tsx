import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { getContent } from "./content.functions";
import type { SiteContent } from "@/data/sgsc";

export const contentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getContent(),
  staleTime: 30_000,
});

const Ctx = createContext<SiteContent | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const { data } = useSuspenseQuery(contentQuery);
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useContent(): SiteContent {
  const c = useContext(Ctx);
  if (!c) throw new Error("useContent must be used inside ContentProvider");
  return c;
}

export { ranking, rankOf, growth, honorsOf, membersOf, display } from "./derive";
