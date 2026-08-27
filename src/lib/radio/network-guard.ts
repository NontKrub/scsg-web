import { isRadioMemoryBackend } from "./config";

const installed = Symbol.for("scsg.radio.supabaseNetworkGuard");

function configuredSupabaseHost() {
  const env = typeof process === "undefined" ? undefined : process.env;
  const configuredUrl = import.meta.env["VITE_SUPABASE_URL"] ?? env?.["SUPABASE_URL"];
  if (!configuredUrl) return "";
  try {
    return new URL(configuredUrl).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function isSupabaseUrl(value: string | URL | Request) {
  const url =
    typeof value === "string"
      ? value
      : typeof Request !== "undefined" && value instanceof Request
        ? value.url
        : value.toString();
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const configuredHost = configuredSupabaseHost();
    return (
      hostname === configuredHost ||
      hostname === "supabase.co" ||
      hostname.endsWith(".supabase.co") ||
      hostname === "supabase.in" ||
      hostname.endsWith(".supabase.in")
    );
  } catch {
    return false;
  }
}

export function installSupabaseNetworkGuard() {
  if (!isRadioMemoryBackend() || typeof globalThis.fetch !== "function") return;
  const scope = globalThis as typeof globalThis & { [installed]?: boolean };
  if (scope[installed]) return;
  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (input, init) => {
    const value =
      typeof Request !== "undefined" && input instanceof Request ? input : String(input);
    if (isSupabaseUrl(value))
      throw new Error("Supabase network request blocked in Radio test mode");
    return originalFetch(input, init);
  };
  scope[installed] = true;
}
