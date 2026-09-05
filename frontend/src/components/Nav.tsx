"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWallet from "./ConnectWallet";

const links = [
  { href: "/", label: "Marketplace" },
  { href: "/mint", label: "Mint" },
  { href: "/collection", label: "My Collection" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav" suppressHydrationWarning>
      <Link href="/" className="nav-brand">
        ⚡ Decard
      </Link>
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "nav-link active" : "nav-link"}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <ConnectWallet />
    </nav>
  );
}
