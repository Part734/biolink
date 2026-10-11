export interface VisitorInfo {
  ip: string;
  device: string;
  country: string;
  referrer: string;
  userAgent: string;
}

function parseDevice(ua: string): string {
  const s = ua.toLowerCase();
  if (/bot|crawler|spider|crawl|slurp|mediapartners|baidu|yandex|sogou|exabot|facebot|ia_archiver/i.test(s)) {
    return "Bot";
  }
  if (/tablet|ipad|playbook|silk(?!.*mobile)/i.test(s)) return "Tablet";
  if (/mobi|android|iphone|ipod|blackberry|iemobile|opera mini|mobile/i.test(s)) return "Mobile";
  return "Desktop";
}

function parseReferrer(referer: string | null): string {
  if (!referer) return "Direct";
  try {
    const u = new URL(referer);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("tiktok.com")) return "TikTok";
    if (host.includes("twitter.com") || host.includes("x.com")) return "X / Twitter";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("discord.com") || host.includes("discord.gg")) return "Discord";
    if (host.includes("facebook.com") || host.includes("fb.com")) return "Facebook";
    if (host.includes("reddit.com")) return "Reddit";
    if (host.includes("twitch.tv")) return "Twitch";
    if (host.includes("snapchat.com")) return "Snapchat";
    if (host.includes("linkedin.com")) return "LinkedIn";
    if (host.includes("google.")) return "Google";
    if (host.includes("bing.com")) return "Bing";
    if (host.includes("f9ed.lol") || host.includes("egirls.lol")) return "Direct";
    return host;
  } catch {
    return "Direct";
  }
}

function parseCountry(headers: Headers): string {
  const candidates = [
    headers.get("x-vercel-ip-country"),
    headers.get("cf-ipcountry"),
    headers.get("x-country-code"),
    headers.get("cloudfront-viewer-country"),
  ];
  for (const c of candidates) {
    if (c && c.trim() && c.trim().toUpperCase() !== "XX") return c.trim().toUpperCase();
  }
  return "Unknown";
}

function parseIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, 64);
  return "unknown";
}

export function getVisitorInfo(headers: Headers): VisitorInfo {
  const userAgent = (headers.get("user-agent") ?? "").slice(0, 500);
  return {
    ip: parseIp(headers),
    device: parseDevice(userAgent),
    country: parseCountry(headers),
    referrer: parseReferrer(headers.get("referer") ?? headers.get("referrer")),
    userAgent,
  };
}

export const DEVICE_COLORS: Record<string, string> = {
  Desktop: "#b35fce",
  Mobile: "#5661f6",
  Tablet: "#22d3ee",
  Bot: "#525252",
};

export const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  BR: "Brazil",
  TR: "Turkey",
  RU: "Russia",
  SA: "Saudi Arabia",
  CA: "Canada",
  AU: "Australia",
  NL: "Netherlands",
  IT: "Italy",
  PL: "Poland",
  SE: "Sweden",
  NO: "Norway",
  IN: "India",
  JP: "Japan",
  KR: "South Korea",
  MX: "Mexico",
};
