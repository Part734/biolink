"use client";

import { useState } from "react";
import V3BarChart from "@/components/dashboard/v3-bar-chart";
import Dropdown from "@/components/dashboard/dropdown";
import { V3Icon } from "@/components/dashboard/v3-icons";
import type { ClickData, CountryData, DeviceData, RangeData, ReferrerData } from "./page";
import { COUNTRY_NAMES } from "@/lib/analytics";

const RANGES = [
  { id: "24h", label: "Last 24 hours" },
  { id: "3d", label: "Last 3 days" },
  { id: "7d", label: "Last 7 days" },
  { id: "14d", label: "Last 14 days", premium: true },
];

const RANGE_DAYS: Record<string, number> = { "24h": 1, "3d": 3, "7d": 7, "14d": 14 };

const DEVICE_DOT: Record<string, string> = {
  Desktop: "bg-[#b35fce]",
  Mobile: "bg-[#5661f6]",
  Tablet: "bg-[#22d3ee]",
  Bot: "bg-[#525252]",
  Unknown: "bg-[#3a3a3a]",
};

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#1c1c1c]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#9a45b2] to-[#d283eb] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

function Empty({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mx-auto my-8 max-w-[400px] px-4 text-center">
      <div className="mx-auto mb-3 grid size-11 place-content-center rounded-2xl bg-[#1a1a1a] text-[#6a6a6a]">
        <V3Icon name="analytics" className="size-5" />
      </div>
      <h1 className="m-0 text-[16px] font-[550] text-[#e6e6e6]">{title}</h1>
      <h3 className="m-0 mt-1 text-[13px] font-[450] leading-relaxed text-[#8a8a8a]">{sub}</h3>
    </div>
  );
}

export default function AnalyticsClient({
  isPremium,
  totalViews,
  totalClicks,
  totalSocialClicks,
  clickRate,
  rangeData,
  devices,
  countries,
  referrers,
  topLinks,
  topSocials,
}: {
  isPremium: boolean;
  totalViews: number;
  totalClicks: number;
  totalSocialClicks: number;
  clickRate: number;
  rangeData: Record<string, RangeData>;
  devices: DeviceData[];
  countries: CountryData[];
  referrers: ReferrerData[];
  topLinks: ClickData[];
  topSocials: ClickData[];
}) {
  const [range, setRange] = useState("7d");
  const [open, setOpen] = useState(false);

  const ranges = RANGES.filter((r) => isPremium || !r.premium);
  const data = rangeData[range] ?? rangeData["7d"];
  const sub = range === "24h" ? "last 24 hours" : `last ${RANGE_DAYS[range] ?? 7} days`;
  const inSub = range === "24h" ? "In the last 24 hours" : `In the last ${RANGE_DAYS[range] ?? 7} days`;
  const emptyHint = "Try sharing your egirls.lol page on social media to get more views!";

  const statCards = [
    { label: "Profile Views", value: totalViews.toLocaleString(), sub: `+${data.count} views since ${sub}`, icon: "eye" },
    { label: "Total Link Clicks", value: totalClicks.toLocaleString(), sub: inSub, icon: "bolt" },
    { label: "Social Clicks", value: totalSocialClicks.toLocaleString(), sub: inSub, icon: "share" },
    { label: "Click Rate", value: `${clickRate.toFixed(1)}%`, sub: "Clicks ÷ views", icon: "chartColumns" },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col">
      {/* header */}
      <div className="rounded-[16px] border border-[#1a1a1a] bg-[#111111] p-5">
        <h1 className="m-0 flex items-center gap-2 text-[20px] font-semibold text-[#f2f2f2]">
          <V3Icon name="analytics" className="size-5 text-[#d7a2e6]" />
          Account Analytics
        </h1>
        <p className="m-0 mt-1 text-[14px] text-[#8a8a8a]">
          Track your profile performance — views, devices, countries, referrers and clicks.
        </p>
      </div>

      {/* range */}
      <div className="mt-4 rounded-[16px] border border-[#1a1a1a] bg-[#111111] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-[15px] font-medium text-[#ddd]">
            Time Range{" "}
            <span className="ml-1 rounded-full border border-[#7e2c8b7c] bg-[#7e2c8b40] px-2.5 py-1 text-[12px] font-medium text-[#e9d3ef]">
              Updated just now
            </span>
          </h2>
        </div>
        <div className="mt-3">
          <Dropdown
            open={open}
            onOpenChange={setOpen}
            label={RANGES.find((r) => r.id === range)?.label ?? "Last 7 days"}
            ariaLabel="Time range"
            icon={
              <span className="grid size-10 shrink-0 place-content-center text-[#8a8a8a]">
                <V3Icon name="calendar" className="size-5" />
              </span>
            }
            buttonClassName={`flex w-full cursor-pointer items-center rounded-[12px] border bg-[#0c0c0c] text-left transition-colors ${
              open ? "border-[#2a2a2a]" : "border-transparent hover:border-[#222]"
            }`}
          >
            {ranges.map((r) => {
              const selected = range === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRange(r.id);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center rounded-[10px] px-3 py-2.5 text-left text-[14px] transition-colors ${
                    selected
                      ? "bg-[#7e2c8b33] font-medium text-white"
                      : "text-[#dcdcdc] hover:bg-[#1b1b1b]"
                  }`}
                >
                  <span>{r.label}</span>
                </button>
              );
            })}
          </Dropdown>
        </div>
      </div>

      {/* stats */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[16px] border border-[#1e1e1e] bg-[#111111] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-[13px] font-medium text-[#9a9a9a]">{card.label}</p>
              <span className="grid size-8 place-content-center rounded-xl bg-[#1a1a1a] text-[#d7a2e6]">
                <V3Icon name={card.icon} className="size-4" />
              </span>
            </div>
            <p className="m-0 mt-2 text-[26px] font-bold tabular-nums text-white">{card.value}</p>
            <p className="m-0 mt-0.5 truncate text-[12px] text-[#7a7a7a]">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* views + devices */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 rounded-[16px] border border-[#1a1a1a] bg-[#111111] p-4">
          <h2 className="m-0 text-[16px] font-semibold text-white">Profile Views</h2>
          <p className="m-0 mt-0.5 text-[13px] text-[#7a7a7a]">Avg {data.avg.toLocaleString()} per day · {sub}</p>
          <div className="mt-3 min-h-[280px]">
            <V3BarChart data={data.buckets} height={300} />
          </div>
        </div>
        <div className="min-w-0 rounded-[16px] border border-[#1a1a1a] bg-[#111111] p-4">
          <h2 className="m-0 text-[16px] font-semibold text-white">Visitor Devices</h2>
          <p className="m-0 mt-0.5 text-[13px] text-[#7a7a7a]">Logged from visitor user-agents</p>
          {devices.length === 0 ? (
            <Empty title="No device data yet" sub={emptyHint} />
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {devices.map((d) => (
                <div key={d.device}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-[14px] font-medium text-[#e6e6e6]">
                      <span className={`size-2.5 shrink-0 rounded-full ${DEVICE_DOT[d.device] ?? DEVICE_DOT.Unknown}`} />
                      <span className="truncate">{d.device}</span>
                    </span>
                    <span className="shrink-0 text-[13px] tabular-nums text-[#8a8a8a]">
                      {d.count.toLocaleString()} · {d.pct}%
                    </span>
                  </div>
                  <Bar pct={d.pct} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* socials + buttons */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-[16px] border border-[#1a1a1a] bg-[#111111] p-4">
          <h2 className="m-0 text-[16px] font-semibold text-white">Most Clicked Socials</h2>
          <p className="m-0 mt-0.5 text-[13px] text-[#7a7a7a]">Clicks per social icon</p>
          {topSocials.length === 0 || topSocials.every((s) => s.clicks === 0) ? (
            <Empty title="No socials clicked yet" sub={emptyHint} />
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {topSocials.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-[#1d1d1d] bg-[#141414] p-3">
                  <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-[#7e2c8b33] text-[13px] font-bold text-[#d7a2e6]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[14px] font-medium text-white">{s.label}</p>
                    <p className="m-0 truncate text-[12px] text-[#7a7a7a]">{s.sub}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#1e1e1e] px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white">
                    {s.clicks.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-[16px] border border-[#1a1a1a] bg-[#111111] p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="m-0 text-[16px] font-semibold text-white">Most Clicked Buttons</h2>
            {isPremium ? (
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#7e2c8b7c] bg-[#7e2c8b40] px-2 py-1 text-[11px] font-semibold text-white">
              <V3Icon name="crown" className="size-3" />
              Premium
            </span>
            ) : null}
          </div>
          <p className="m-0 mt-0.5 text-[13px] text-[#7a7a7a]">Clicks per social button</p>
          {topLinks.length === 0 || topLinks.every((l) => l.clicks === 0) ? (
            <Empty title="No buttons clicked yet" sub={emptyHint} />
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {topLinks.map((l, i) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl border border-[#1d1d1d] bg-[#141414] p-3">
                  <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-[#1e1e1e] text-[13px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[14px] font-medium text-white">{l.label}</p>
                    <p className="m-0 truncate text-[12px] text-[#7a7a7a]">{l.sub}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#1e1e1e] px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white">
                    {l.clicks.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* referrers + countries */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-[16px] border border-[#1a1a1a] bg-[#111111] p-4">
          <div className="flex items-center gap-1.5">
            <h2 className="m-0 text-[16px] font-semibold text-white">Top Referrers</h2>
            <span className="cursor-help text-[#6a6a6a]" title="Where your visitors come from — e.g. a view from your Instagram bio shows as Instagram">
              <V3Icon name="info" className="size-4" />
            </span>
          </div>
          <p className="m-0 mt-0.5 text-[13px] text-[#7a7a7a]">Instagram, TikTok, Direct…</p>
          {referrers.length === 0 ? (
            <Empty title="No referrers yet" sub={emptyHint} />
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {referrers.map((r) => (
                <div key={r.referrer}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-[14px]">
                    <span className="truncate font-medium text-[#e6e6e6]">{r.referrer}</span>
                    <span className="shrink-0 tabular-nums text-[13px] text-[#8a8a8a]">
                      {r.count.toLocaleString()} · {r.pct}%
                    </span>
                  </div>
                  <Bar pct={r.pct} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-[16px] border border-[#1a1a1a] bg-[#111111] p-4">
          <h2 className="m-0 text-[16px] font-semibold text-white">Top Countries by Views</h2>
          <p className="m-0 mt-0.5 text-[13px] text-[#7a7a7a]">Logged from visitor IPs</p>
          {countries.length === 0 || (countries.length === 1 && countries[0].country === "UNKNOWN") ? (
            <Empty title="No countries data yet" sub={emptyHint} />
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {countries.filter((c) => c.country !== "UNKNOWN").map((c, i) => (
                <div key={c.country} className="flex items-center gap-3 rounded-xl border border-[#1d1d1d] bg-[#141414] p-3">
                  <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-[#1e1e1e] text-[12px] font-bold text-white">
                    {c.country === "UNKNOWN" ? "—" : c.country}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[14px] font-medium text-white">
                      {COUNTRY_NAMES[c.country] ?? (c.country === "UNKNOWN" ? "Unknown" : c.country)}
                    </p>
                    <div className="mt-1.5">
                      <Bar pct={c.pct} />
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] tabular-nums text-[#8a8a8a]">
                    #{i + 1} · {c.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
