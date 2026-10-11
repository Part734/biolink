"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal, { modalGhostBtn, modalPrimaryBtn } from "@/components/dashboard/modal";
import { useToastStack } from "@/components/ui/toast-stack";
import { getPlatformName, socialIcons } from "@/components/profile/profile-card";
import type { SocialRow } from "./page";

const SECTION_LABEL = "ml-[5px] text-[22.5px] font-[600] text-[#bebebe]";
const CARD = "mt-[15px] flex flex-col gap-[12px] rounded-[15px] bg-[#111111] p-[15px]";

const PLATFORMS = Object.keys(socialIcons).filter((p) => p !== "custom");

/** Brand color per platform so the picker/list icons match each service. */
const SOCIAL_BRAND_COLORS: Record<string, string> = {
  instagram: "#e4405f",
  youtube: "#ff0000",
  tiktok: "#25f4ee",
  discord: "#5865f2",
  twitter: "#e6e6e6",
  github: "#ffffff",
  telegram: "#2aabee",
  snapchat: "#fffc00",
  reddit: "#ff4500",
  twitch: "#9146ff",
  lastfm: "#d51007",
  spotify: "#1db955",
  bitcoin: "#f7931a",
  ethereum: "#627eea",
  solana: "#9945ff",
  paypal: "#0070e0",
  steam: "#66c0f4",
  roblox: "#e2231a",
  soundcloud: "#ff5500",
  kick: "#53fc18",
  onlyfans: "#00aff0",
  custom: "#e6e6e6",
};

function PlatformIcon({ platform, iconUrl, size = 22 }: { platform: string; iconUrl?: string | null; size?: number }) {
  const key = platform.trim().toLowerCase();
  const path = socialIcons[key];
  if (key === "custom" && iconUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={iconUrl} alt={platform} style={{ width: size, height: size }} className="rounded object-cover" />;
  }
  if (!path) {
    return (
      <span
        className="grid shrink-0 place-content-center rounded bg-[#2a2a2a] font-bold text-white"
        style={{ width: size, height: size, fontSize: size * 0.55 }}
      >
        {platform[0]?.toUpperCase() ?? "?"}
      </span>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: size, height: size }} className="block shrink-0">
      <path d={path} />
    </svg>
  );
}

export default function SocialsClient({ initial }: { initial: SocialRow[] }) {
  const router = useRouter();
  const { pushToast } = useToastStack();

  const [rows, setRows] = useState<SocialRow[]>(initial);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const have = new Set(rows.map((r) => r.platform.toLowerCase()));

  async function persistSocials(next: Array<{ platform: string; url: string; iconUrl: string | null; order: number }>) {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ socialLinks: next }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "Could not save.");
    }
  }

  async function refreshSocials() {
    const res = await fetch("/api/profile", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    const fresh: SocialRow[] = (data?.socialLinks ?? []).map(
      (r: { id: string; platform: string; url: string; iconUrl: string | null; clicks: number | null }) => ({
        id: r.id,
        platform: r.platform,
        url: r.url,
        iconUrl: r.iconUrl,
        clicks: r.clicks ?? 0,
      })
    );
    setRows(fresh);
  }

  function pickPlatform(p: string) {
    setPicked(p);
    setUrl("");
    setIconUrl("");
    setError(null);
  }

  async function addSocial() {
    if (!picked) return;
    const clean = url.trim();
    if (!/^https?:\/\/.+/i.test(clean)) {
      setError("URL must start with http:// or https://");
      return;
    }
    if (picked === "custom" && !iconUrl.trim()) {
      setError("Custom links need an icon URL so they show on your profile.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = [
        ...rows,
        { id: `tmp-${Date.now()}`, platform: picked, url: clean.slice(0, 2000), iconUrl: picked === "custom" ? iconUrl.trim().slice(0, 2000) : null, clicks: 0 },
      ];
      await persistSocials(next.map((r, i) => ({ platform: r.platform, url: r.url, iconUrl: r.iconUrl, order: i })));
      await refreshSocials();
      setPicked(null);
      pushToast("Social added!");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function removeSocial(id: string) {
    const prev = rows;
    const next = rows.filter((r) => r.id !== id);
    setRows(next);
    try {
      await persistSocials(next.map((r, i) => ({ platform: r.platform, url: r.url, iconUrl: r.iconUrl, order: i })));
      pushToast("Social removed.");
      router.refresh();
    } catch {
      setRows(prev);
      pushToast("Could not delete.");
    }
  }

  return (
    <div className="flex w-full flex-col">
      <section>
        <div className="flex items-center gap-2">
          <h1 className="m-0 flex items-center gap-2 text-[19px] font-[500] text-[#dddddd]">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className="text-[22px] text-[#8a8a8a]">
              <path fill="currentColor" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71a5 5 0 0 0-1.7 3.29a5 5 0 0 0 3.95 3.53m-2 0a5 5 0 0 0-3.95-3.53a5 5 0 0 0-1.7-3.29l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71a5 5 0 0 0 1.87-1.54Z" />
            </svg>
            Link your social media profiles.
          </h1>
        </div>
        <h3 className="m-0 ml-[3px] mt-1 text-[14px] font-[450] text-[#8a8a8a]">
          Pick a social media to add to your profile.
        </h3>
        <div className="mt-[15px] grid grid-cols-6 gap-2 rounded-[15px] bg-[#111111] p-[15px]">
          {PLATFORMS.map((p) => {
            const taken = have.has(p);
            return (
              <button
                key={p}
                type="button"
                disabled={taken}
                title={getPlatformName(p)}
                onClick={() => {
                  setPicked(p);
                  setUrl("");
                  setIconUrl("");
                  setError(null);
                }}
                style={{ color: SOCIAL_BRAND_COLORS[p] ?? "#e6e6e6" }}
                className={`grid aspect-square cursor-pointer place-items-center rounded-[12px] border-2 transition active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-30 ${
                  taken
                    ? "border-[#1e1e1e] bg-[#101010]"
                    : "border-[#222] bg-[#0c0c0c] hover:border-[#3a3a3a] hover:bg-[#141414]"
                }`}
              >
                <PlatformIcon platform={p} size={22} />
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setPicked("custom");
              setUrl("");
              setIconUrl("");
              setError(null);
            }}
            className="col-span-2 flex cursor-pointer items-center gap-2 rounded-[12px] border-2 border-[#222] bg-[#0c0c0c] p-3 text-left text-[#e6e6e6] transition hover:border-[#3a3a3a] hover:bg-[#141414] active:translate-y-[2px]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span>
              <span className="block text-[13px] font-semibold text-white">Add Custom URL</span>
              <span className="block text-[11px] text-[#8a8a8a]">Use your own URL and icon.</span>
            </span>
          </button>
        </div>
      </section>

      <section className="mt-[25px]">
        <span className={SECTION_LABEL}>Social Links</span>
        <div className={CARD}>
          {rows.length === 0 ? (
            <div className="animate-fade-in h-36 w-full overflow-hidden px-4 [mask-image:linear-gradient(transparent,black_10%,black_90%,transparent)]">
              <div className="animate-scroll-y flex flex-col gap-y-6">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-full rounded-md border border-[#2a2a2a] bg-[#161616]">
                    <div className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-md bg-[#2a2a2a]" />
                        <div className="flex flex-col gap-1">
                          <div className="h-2.5 w-14 rounded-sm bg-[#2a2a2a]" />
                          <div className="h-2.5 w-20 rounded-sm bg-[#2a2a2a]" />
                        </div>
                      </div>
                      <div className="size-4 rounded-sm bg-[#2a2a2a]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            rows.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-[15px] border-2 border-[#1c1c1c] bg-[#0c0c0c] p-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-content-center rounded-[12px] bg-[#1a1a1a]"
                    style={{ color: SOCIAL_BRAND_COLORS[s.platform.trim().toLowerCase()] ?? "#e6e6e6" }}
                  >
                    <PlatformIcon platform={s.platform} iconUrl={s.iconUrl} size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[15px] font-medium text-white">
                      {getPlatformName(s.platform)}
                    </p>
                    <p className="m-0 truncate text-[12px] text-[#707070]">{s.url}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-[#1e1e1e] px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white">
                    {s.clicks.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${s.platform}`}
                    onClick={() => removeSocial(s.id)}
                    className="grid size-8 cursor-pointer place-items-center rounded-lg border border-[#3a1d1d] bg-[#2a1515] text-[#f87171] transition hover:bg-[#3a1d1d]"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Modal
        open={picked !== null}
        onClose={() => setPicked(null)}
        title=""
        maxWidth="max-w-[36rem]"
      >
        {picked && (
          <div>
            <div className="flex items-center gap-3 rounded-[12px] border border-[#222] bg-[#0e0e0e] p-3">
              <span
                className="grid size-10 shrink-0 place-content-center rounded-[10px] bg-[#1a1a1a]"
                style={{ color: SOCIAL_BRAND_COLORS[picked.trim().toLowerCase()] ?? "#e6e6e6" }}
              >
                <PlatformIcon platform={picked} iconUrl={picked === "custom" ? iconUrl || undefined : undefined} size={22} />
              </span>
              <p className="m-0 text-[15px] font-semibold text-white">{getPlatformName(picked)}</p>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <p className="m-0 mb-1.5 ml-1 text-[13px] font-medium text-[#c9c9c9]">Link URL</p>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full rounded-[12px] border-2 border-transparent bg-[#0c0c0c] p-3 text-[15px] text-white outline-none placeholder:text-[#555] focus:border-[#2a2a2a]"
                />
              </div>
              {picked === "custom" && (
                <div>
                  <p className="m-0 mb-1.5 ml-1 text-[13px] font-medium text-[#c9c9c9]">Icon image URL</p>
                  <input
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://…/icon.png"
                    spellCheck={false}
                    autoComplete="off"
                    className="w-full rounded-[12px] border-2 border-transparent bg-[#0c0c0c] p-3 text-[15px] text-white outline-none placeholder:text-[#555] focus:border-[#2a2a2a]"
                  />
                </div>
              )}
            </div>
            {error ? <p className="m-0 mt-2 text-[13px] text-[#f87171]">{error}</p> : null}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setPicked(null)} className={`${modalGhostBtn} flex-1`}>
                Back
              </button>
              <button type="button" onClick={addSocial} disabled={busy || !url.trim()} className={`${modalPrimaryBtn} flex-1`}>
                {busy ? "Saving…" : "Add Social"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
