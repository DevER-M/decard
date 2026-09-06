"use client";

import Nav from "../../components/Nav";
import MintForm from "../../components/MintForm";

export default function MintPage() {
  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <section className="mb-10 sm:mb-12">
          <div className="neo-border bg-neo-accent neo-shadow-xl p-6 sm:p-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neo-ink text-neo-bg neo-border border-4 border-neo-ink mb-4 font-black uppercase tracking-widest text-xs">
              Mint a Card
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
              Make Something Rare.
            </h1>
            <p className="mt-3 max-w-xl mx-auto font-bold text-base sm:text-lg">
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
