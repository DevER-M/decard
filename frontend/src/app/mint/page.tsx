"use client";

import Nav from "../../components/Nav";
import MintForm from "../../components/MintForm";

export default function MintPage() {
  return (
    <>
      <Nav />
      <main className="container">
        <h1 className="page-title">Mint a Card</h1>
        <p className="page-subtitle">
          Upload a card image, set its name and attributes, then mint it as an NFT on Sepolia.
        </p>
        <MintForm />
      </main>
    </>
  );
}
