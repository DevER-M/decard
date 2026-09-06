"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWallet from "./ConnectWallet";

type NavLink = { href: string; label: string; target?: string; rel?: string };

const links: NavLink[] = [
  { href: "/", label: "Marketplace" },
  { href: "/mint", label: "Mint" },
  { href: "/collection", label: "My Collection" },
  { href: "https://sepolia-faucet.pk910.de/", label: "Get ETH", target: "_blank", rel: "noopener noreferrer" },
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
          <span className="inline-flex h-10 w-10 items-center justify-center bg-white neo-border neo-shadow-sm group-hover:rotate-[-6deg] transition-transform duration-200">
            <img src="favicon.svg"></img>
          </span>
          <span className="font-black uppercase tracking-tighter text-2xl sm:text-3xl">
            Decard
          </span>
        </Link>

        <div className="flex-1 flex items-center gap-2 sm:gap-3 ml-2 sm:ml-6">
          {links.map((link) => {
            const isExternal = !!link.target;
            const isActive = !isExternal && pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                rel={link.rel}
                className={[
                  "px-3 sm:px-4 py-2 font-bold uppercase text-sm tracking-wide neo-border",
                  "neo-press-sm transition-colors duration-100",
                  isActive && !isExternal
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