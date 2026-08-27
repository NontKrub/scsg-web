export function isRadioMemoryBackend() {
  return (
    typeof process !== "undefined" &&
    process.env["NODE_ENV"] === "test" &&
    process.env["RADIO_BACKEND"] === "memory"
  );
}
