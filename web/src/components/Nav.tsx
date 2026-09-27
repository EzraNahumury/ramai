"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";
import { ReputationBadge } from "./ReputationBadge";

const links = [
  { href: "/events", label: "Discover" },
  { href: "/create", label: "Create" },
  { href: "/organizer", label: "Organizer" },
  { href: "/profile", label: "Interests" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-xl font-semibold tracking-tight">Ramai</span>
          </Link>
          <div className="mono hidden items-center gap-5 text-[13px] sm:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`transition-colors ${
                    active ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ReputationBadge />
          <WalletButton />
        </div>
      </nav>
    </header>
  );
}

/** Logo: a small cluster of dots forming an R-corner — the "ramai" (crowd) mark. */
function Logo() {
  return (
    <span className="grid grid-cols-2 gap-0.5" aria-hidden>
      <span className="h-2 w-2 rounded-full bg-accent" />
      <span className="h-2 w-2 rounded-full bg-accent/40" />
      <span className="h-2 w-2 rounded-full bg-accent/40" />
      <span className="h-2 w-2 rounded-full bg-accent" />
    </span>
  );
}
