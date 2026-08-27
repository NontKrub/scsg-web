export const RADIO_TEST_ADMIN_ID = "radio-test-admin";

export function isRadioMemoryBackend() {
  const viteMode = import.meta.env["VITE_RADIO_BACKEND"];
  const serverMode = typeof process === "undefined" ? undefined : process.env["RADIO_BACKEND"];
  const viteServerMode =
    typeof process === "undefined" ? undefined : process.env["VITE_RADIO_BACKEND"];
  return viteMode === "memory" || serverMode === "memory" || viteServerMode === "memory";
}
