"use client";

import Link from "next/link";

const GITHUB = "https://github.com/EzraNahumury/ramai";
const EVENTS_CONTRACT =
  "https://testnet.bscscan.com/address/0x0FBA1927De712757cDB75264d5700cF239cCa992";

const colA = [
  { label: "Discover", href: "/events" },
  { label: "Create", href: "/create" },
  { label: "Organizer", href: "/organizer" },
  { label: "Interests", href: "/profile" },
];
const colB = [
  { label: "GitHub", href: GITHUB, ext: true },
  { label: "Contract", href: EVENTS_CONTRACT, ext: true },
  { label: "BNB Chain", href: "https://www.bnbchain.org", ext: true },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-[#0c0d12] text-[#f3f4f7]">
      {/* ghost wordmark */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-0.15em] select-none text-center font-display font-semibold leading-none text-white/[0.035]"
        style={{ fontSize: "clamp(5rem, 18vw, 16rem)" }}
      >
        Ramai
      </span>

      <div className="relative mx-auto max-w-5xl px-4 py-16">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          {/* brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="grid grid-cols-2 gap-0.5" aria-hidden>
                <span className="h-2 w-2 rounded-full bg-[#ff6a3a]" />
                <span className="h-2 w-2 rounded-full bg-[#ff6a3a]/40" />
                <span className="h-2 w-2 rounded-full bg-[#ff6a3a]/40" />
                <span className="h-2 w-2 rounded-full bg-[#ff6a3a]" />
              </span>
              <span className="font-display text-lg font-semibold">Ramai</span>
            </div>
            <p className="mono mt-3 max-w-[15rem] text-xs leading-5 text-white/45">
              Events that fill up — and actually show up.
            </p>
          </div>

          {/* link columns */}
          <div className="flex gap-14">
            <ul className="mono space-y-3 text-[13px] tracking-wide">
              {colA.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/75 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mono space-y-3 text-[13px] tracking-wide">
              {colB.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/75 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-fit items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-6 py-5 text-sm font-medium transition-colors hover:bg-white/[0.06]"
          >
            <span aria-hidden>↑</span> Back to top
          </button>
        </div>

        <div className="mono mt-16 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <span>© 2026 Ramai. MIT-licensed.</span>
          <span>BNB Smart Chain Testnet · Indonesia Web3 Hackathon 2026</span>
        </div>
      </div>
    </footer>
  );
}
