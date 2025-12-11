export type UserOS = "android" | "ios" | "windows" | "linux" | "unknown";
export function detectOS(ua?: string | null): UserOS {
  if (!ua) return "unknown";

  const s = ua.toLowerCase();

  // Order matters
  if (s.includes("android")) return "android";

  // iPhone, iPad, iPod all report like this
  if (s.includes("iphone") || s.includes("ipad") || s.includes("ipod")) {
    return "ios";
  }

  if (s.includes("windows nt")) return "windows";

  // Android already matched above; plain "linux" now means desktop Linux
  if (s.includes("linux")) return "linux";

  return "unknown";
}
