"use client";

import { useState } from "react";
import { useIPFS } from "../hooks/useIPFS";
import { useGameCard } from "../hooks/useGameCard";
import type { CardType, Rarity } from "../types";

const RARITIES: Rarity[] = ["Common", "Uncommon", "Rare", "Legendary", "Mythical"];
const TYPES: CardType[] = ["Fire", "Water", "Grass", "Electric", "Psychic"];

export default function MintForm() {
  const { upload, loading: uploading } = useIPFS();
  const { mint } = useGameCard();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CardType>("Fire");
  const [rarity, setRarity] = useState<Rarity>("Common");
  const [attack, setAttack] = useState(50);
  const [defense, setDefense] = useState(50);
  const [hp, setHp] = useState(100);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleMint() {
    setError(null);
    setSuccess(null);
    if (!image) {
      setError("Please select an image.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }

    try {
      setMinting(true);
      const attributes = [
        { trait_type: "Rarity", value: rarity },
        { trait_type: "Type", value: type },
        { trait_type: "Attack", value: attack },
        { trait_type: "Defense", value: defense },
        { trait_type: "HP", value: hp },
      ];

      const metadataUri = await upload({
        image,
        name,
        description,
        attributes,
      });

      const hash = await mint(metadataUri);
      setSuccess(`Card minted! Tx: ${hash.slice(0, 10)}…`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className="mint-form">
      <div className="form-row">
        <div className="form-group">
          <label>Card Image</label>
          <input type="file" accept="image/*" onChange={handleImage} />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="mint-preview" />
          )}
        </div>

        <div className="form-group">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pikachu VMAX" />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Legendary electric card"
            rows={3}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as CardType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Rarity</label>
          <select value={rarity} onChange={(e) => setRarity(e.target.value as Rarity)}>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Attack ({attack})</label>
          <input
            type="range"
            min={1}
            max={200}
            value={attack}
            onChange={(e) => setAttack(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>Defense ({defense})</label>
          <input
            type="range"
            min={1}
            max={200}
            value={defense}
            onChange={(e) => setDefense(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>HP ({hp})</label>
          <input
            type="range"
            min={10}
            max={500}
            value={hp}
            onChange={(e) => setHp(Number(e.target.value))}
          />
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleMint} disabled={uploading || minting}>
          {uploading ? "Uploading to IPFS…" : minting ? "Minting…" : "Mint Card"}
        </button>
      </div>
    </div>
  );
}
