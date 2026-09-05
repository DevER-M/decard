"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import ConnectWallet from "./ConnectWallet";

const links = [
  { href: "/", label: "Marketplace" },
  { href: "/mint", label: "Mint" },
  { href: "/collection", label: "My Collection" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      suppressHydrationWarning
      className="sticky top-0 z-30 bg-neo-bg border-b-4 border-black"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 sm:px-6 py-3 sm:py-4">
        <Link
          href="/"
          className="group flex items-center gap-2 neo-press-sm"
          aria-label="Decard home"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center bg-neo-accent neo-border neo-shadow-sm group-hover:rotate-[-6deg] transition-transform duration-200">
            <Zap strokeWidth={3} className="h-5 w-5 text-black" fill="black" />
          </span>
          <span className="font-black uppercase tracking-tighter text-2xl sm:text-3xl">
            Decard
          </span>
        </Link>

        <div className="flex-1 flex items-center gap-2 sm:gap-3 ml-2 sm:ml-6">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "px-3 sm:px-4 py-2 font-bold uppercase text-sm tracking-wide neo-border",
                  "neo-press-sm transition-colors duration-100",
                  active
                    ? "bg-neo-secondary shadow-[4px_4px_0_0_#000]"
                    : "bg-neo-bg hover:bg-neo-accent",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <ConnectWallet />
      </div>
    </nav>
  );
}
