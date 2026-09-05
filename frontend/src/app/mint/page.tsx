"use client";

import Nav from "../../components/Nav";
import MintForm from "../../components/MintForm";

export default function MintPage() {
  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <section className="mb-10 sm:mb-12">
          <div className="neo-border bg-neo-accent neo-shadow-xl p-6 sm:p-10 -rotate-[0.5deg]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neo-ink text-neo-bg neo-border border-4 border-neo-ink mb-4 font-black uppercase tracking-widest text-xs rotate-[2deg]">
              Mint a Card
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
              <span className="block">Make</span>
              <span className="block">
                <span
                  className="text-neo-bg"
                  style={{ WebkitTextStroke: "2px black" }}
                >
                  Something
                </span>
              </span>
              <span className="block">Rare.</span>
            </h1>
            <p className="mt-4 font-bold text-base sm:text-lg max-w-2xl">
              Pick a Pokémon, lock in stats, pin to IPFS, mint as an NFT on
              Sepolia.
            </p>
          </div>
        </section>

        <MintForm />
      </main>
    </>
  );
}
