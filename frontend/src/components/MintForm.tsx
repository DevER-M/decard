"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useWaitForTransactionReceipt } from "wagmi";
import {
  usePokemonCardSearch,
  usePokemonCardById,
  mapCardType,
  mapRarity,
  calculateAttack,
  calculateDefense,
  calculateHP,
  generateDescription,
} from "../hooks/usePokemonTCG";
import { useIPFS } from "../hooks/useIPFS";
import { useGameCard } from "../hooks/useGameCard";
import type { CardType, Rarity } from "../types";
import { buildImageUrl, TCGdexCardBrief, TCGdexCard } from "../lib/pokemon-tcg";
import { RARITIES, CARD_TYPES as TYPES } from "../lib/cardOptions";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

const DEFAULTS = {
  name: "",
  description: "",
  type: "Fire" as CardType,
  rarity: "Common" as Rarity,
  attack: 50,
  defense: 50,
  hp: 100,
};

function safeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 60) || "card";
}

export default function MintForm() {
  const { upload, loading: uploading } = useIPFS();
  const { mint } = useGameCard();
  const { isConnected } = useAccount();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const initializedFor = useRef<string | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState(DEFAULTS.name);
  const [description, setDescription] = useState(DEFAULTS.description);
  const [type, setType] = useState<CardType>(DEFAULTS.type);
  const [rarity, setRarity] = useState<Rarity>(DEFAULTS.rarity);
  const [attack, setAttack] = useState(DEFAULTS.attack);
  const [defense, setDefense] = useState(DEFAULTS.defense);
  const [hp, setHp] = useState(DEFAULTS.hp);
  const [minting, setMinting] = useState(false);
  const [mintHash, setMintHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const { isSuccess: mintConfirmed, isError: mintReverted, isLoading: mintPending } =
    useWaitForTransactionReceipt({
      hash: mintHash ?? undefined,
    });

  const { data: searchResult, isFetching, refetch } = usePokemonCardSearch(searchQuery, searchEnabled);

  const { data: selectedCard } = usePokemonCardById(selectedCardId ?? "");

  // Only auto-fill form fields the FIRST time we successfully load a card
  // for a given selection. Refetches (e.g. from background invalidations)
  // must NOT overwrite any values the user has already edited.
  useEffect(() => {
    if (!selectedCard) return;
    if (selectedCard.id !== selectedCardId) return;
    if (initializedFor.current === selectedCard.id) return;

    setName(selectedCard.name);
    setType(mapCardType(selectedCard.types ?? []));
    setRarity(mapRarity(selectedCard.rarity));
    setAttack(calculateAttack(selectedCard));
    setDefense(calculateDefense(selectedCard));
    setHp(calculateHP(selectedCard));
    setDescription(generateDescription(selectedCard));

    const hiUrl = buildImageUrl(selectedCard.image, "high", "webp");
    if (hiUrl) setPreview(hiUrl);

    initializedFor.current = selectedCard.id;
  }, [selectedCard, selectedCardId]);

  function resetForm() {
    setSelectedCardId(null);
    initializedFor.current = null;
    setName(DEFAULTS.name);
    setDescription(DEFAULTS.description);
    setType(DEFAULTS.type);
    setRarity(DEFAULTS.rarity);
    setAttack(DEFAULTS.attack);
    setDefense(DEFAULTS.defense);
    setHp(DEFAULTS.hp);
    setPreview(null);
    setMintHash(null);
    setMinting(false);
  }

  // React to the receipt status of the mint tx:
  //  - confirmed → success + reset
  //  - reverted (isError) → surface a clear message, clear hash so the spinner stops
  //  - pending for a long time → keep the "Submitted…" message (handled by render branch)
  useEffect(() => {
    if (!mintHash) return;
    if (mintConfirmed) {
      setSuccess("Card minted successfully!");
      setMintHash(null);
      setMinting(false);
      resetForm();
    } else if (mintReverted) {
      setError("Mint transaction reverted on-chain. Please try again.");
      setMintHash(null);
      setMinting(false);
    }
  }, [mintConfirmed, mintReverted, mintHash]);

  function handleCardSelect(brief: TCGdexCardBrief) {
    setSelectedCardId(brief.id);
    initializedFor.current = null;
    setName(brief.name);
    const url = buildImageUrl(brief.image, "low", "webp");
    if (url) setPreview(url);
  }

  function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearchEnabled(true);
    refetch();
  }

  async function handleMint() {
    setError(null);
    setSuccess(null);

    if (!isConnected) {
      setError("Connect your wallet to mint.");
      return;
    }
    if (!selectedCardId || !selectedCard) {
      setError("Please select a card first.");
      return;
    }
    if (!name.trim()) {
      setError("Card name is required.");
      return;
    }
    if (minting) return;

    const hiUrl = buildImageUrl(selectedCard.image, "high", "webp");
    if (!hiUrl) {
      setError("No image available for the selected card.");
      return;
    }

    try {
      setMinting(true);

      const blob = await fetch(hiUrl).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
        return res.blob();
      });

      if (!ALLOWED_IMAGE_TYPES.includes(blob.type)) {
        throw new Error(
          `Unsupported image type "${blob.type || "unknown"}". Allowed: PNG, JPEG, WebP, GIF.`,
        );
      }
      if (blob.size > MAX_IMAGE_BYTES) {
        throw new Error(
          `Image too large (${(blob.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`,
        );
      }

      const ext = (blob.type.split("/")[1] || "webp").replace("jpeg", "jpg");
      const base = safeFilename(name);
      const stamp = Date.now().toString(36);
      const imageFile = new File([blob], `${base}-${stamp}.${ext}`, { type: blob.type });

      const attributes = [
        { trait_type: "Rarity", value: rarity },
        { trait_type: "Type", value: type },
        { trait_type: "Attack", value: attack },
        { trait_type: "Defense", value: defense },
        { trait_type: "HP", value: hp },
      ];

      const metadataUri = await upload({
        image: imageFile,
        name,
        description,
        attributes,
      });

      const hash = await mint(metadataUri);
      setMintHash(hash);
      setSuccess(`Submitted — waiting for confirmation… Tx: ${hash.slice(0, 10)}…`);
    } catch (err) {
      setError((err as Error).message);
      setMinting(false);
      setMintHash(null);
    }
  }

  const cards: TCGdexCardBrief[] = searchResult ?? [];
  const hasSelection = mounted && !!selectedCardId;
  const waitingForConfirmation = !!mintHash && !mintConfirmed && !mintReverted;

  return (
    <div className="mint-form">
      <div className="form-group">
        <label>Search Pokémon Card</label>
        <div className="search-row">
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchEnabled(false);
              setSelectedCardId(null);
              initializedFor.current = null;
            }}
            placeholder="Pikachu, Charizard, Bulbasaur..."
            disabled={mounted ? !!isFetching : false}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={mounted ? !!(isFetching || !searchQuery.trim()) : !searchQuery.trim()}
          >
            {mounted && isFetching ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {mounted && cards.length > 0 && !hasSelection && (
        <div className="card-suggestions">
          <h4>Search Results — hover for stats</h4>
          <div className="suggestions-list">
            {cards.slice(0, 20).map((card) => {
              const url = buildImageUrl(card.image, "low", "webp");
              const hasError = imgErrors.has(card.id);
              return (
                <button
                  key={card.id}
                  className="suggestion-item"
                  onClick={() => handleCardSelect(card)}
                  type="button"
                >
                  <div className="suggestion-image-wrap">
                    {url && !hasError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={card.name}
                        className="suggestion-img"
                        loading="lazy"
                        onError={() =>
                          setImgErrors((prev) => new Set(prev).add(card.id))
                        }
                      />
                    ) : (
                      <div className="suggestion-placeholder">
                        {hasError ? "Image unavailable" : "No image"}
                      </div>
                    )}
                    <div className="suggestion-overlay">
                      <div className="suggestion-overlay-name">{card.name}</div>
                      <div className="suggestion-overlay-meta">
                        <span>Set: {card.id.split("-")[0]}</span>
                        <span>#{card.localId}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasSelection ? (
        <div className="card-summary">
          <h4>Selected Card</h4>
          <dl className="card-summary-list">
            <dt>Name</dt>
            <dd>{name || "—"}</dd>

            <dt>Type</dt>
            <dd>{type}</dd>

            <dt>Rarity</dt>
            <dd>{rarity}</dd>

            <dt>Attack</dt>
            <dd>{attack}</dd>

            <dt>Defense</dt>
            <dd>{defense}</dd>

            <dt>HP</dt>
            <dd>{hp}</dd>

            <dt>Description</dt>
            <dd>{description || "—"}</dd>
          </dl>
        </div>
      ) : (
        <p className="hint">Search for a Pokémon and pick a result to load its stats.</p>
      )}

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="form-actions">
        <button
          className="btn btn-primary"
          onClick={handleMint}
          disabled={mounted ? !!(uploading || minting || !hasSelection || !isConnected) : false}
        >
          {!mounted
            ? "Mint Card"
            : !isConnected
              ? "Connect wallet to mint"
              : uploading
                ? "Uploading to IPFS…"
                : minting
                  ? waitingForConfirmation
                    ? "Waiting for confirmation…"
                    : mintPending
                      ? "Confirming…"
                      : "Confirm in wallet…"
                  : "Mint Card"}
        </button>
      </div>
    </div>
  );
}