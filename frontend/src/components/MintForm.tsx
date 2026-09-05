"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useWaitForTransactionReceipt } from "wagmi";
import { Search, Sparkles, Upload, Loader2 } from "lucide-react";
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

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

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
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 60) || "card"
  );
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

  const {
    isSuccess: mintConfirmed,
    isError: mintReverted,
    isLoading: mintPending,
  } = useWaitForTransactionReceipt({
    hash: mintHash ?? undefined,
  });

  const { data: searchResult, isFetching, refetch } = usePokemonCardSearch(
    searchQuery,
    searchEnabled,
  );
  const { data: selectedCard } = usePokemonCardById(selectedCardId ?? "");

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
      const imageFile = new File([blob], `${base}-${stamp}.${ext}`, {
        type: blob.type,
      });

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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* LEFT: search + summary */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="neo-border bg-neo-white neo-shadow-lg p-6 sm:p-8 rotate-[0.5deg]">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex h-10 w-10 items-center justify-center bg-neo-accent neo-border">
              <Search strokeWidth={3} className="h-5 w-5" />
            </span>
            <h3 className="text-2xl font-black uppercase tracking-tight">
              Find a Pokémon
            </h3>
          </div>

          <div className="flex gap-3">
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchEnabled(false);
                setSelectedCardId(null);
                initializedFor.current = null;
              }}
              placeholder="Pikachu, Charizard, Bulbasaur…"
              className="neo-border bg-neo-bg h-14 px-4 flex-1 font-black text-lg placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0_0_#000] focus:outline-none transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={mounted ? !!(isFetching || !searchQuery.trim()) : !searchQuery.trim()}
              className="neo-border bg-neo-secondary px-5 h-14 font-black uppercase tracking-widest text-sm neo-press-sm disabled:opacity-60 flex items-center gap-2"
            >
              {mounted && isFetching ? (
                <Loader2 strokeWidth={3} className="h-5 w-5 animate-spin" />
              ) : (
                <Search strokeWidth={3} className="h-5 w-5" />
              )}
              Search
            </button>
          </div>

          {mounted && cards.length > 0 && !hasSelection && (
            <div className="mt-6">
              <div className="text-xs font-black uppercase tracking-widest mb-3 text-black/70">
                Pick a result
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {cards.slice(0, 20).map((card) => {
                  const url = buildImageUrl(card.image, "low", "webp");
                  const hasError = imgErrors.has(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleCardSelect(card)}
                      className="neo-border bg-neo-bg p-1.5 neo-press-sm hover:bg-neo-secondary transition-colors"
                    >
                      {url && !hasError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={card.name}
                          loading="lazy"
                          className="w-full aspect-[5/7] object-cover"
                          onError={() =>
                            setImgErrors((prev) => new Set(prev).add(card.id))
                          }
                        />
                      ) : (
                        <div className="w-full aspect-[5/7] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-black/50">
                          No image
                        </div>
                      )}
                      <div className="mt-1 text-[10px] font-black uppercase tracking-tight truncate text-center">
                        {card.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {hasSelection && selectedCard ? (
          <div className="neo-border bg-neo-muted/40 neo-shadow p-6 -rotate-[0.5deg]">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center bg-neo-ink text-neo-bg neo-border">
                <Sparkles strokeWidth={3} className="h-5 w-5" />
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight">Selected</h3>
            </div>
            <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 font-bold">
              <dt className="uppercase tracking-widest text-xs text-black/70">Name</dt>
              <dd>{name || "—"}</dd>
              <dt className="uppercase tracking-widest text-xs text-black/70">Type</dt>
              <dd className="inline-flex">
                <span className="px-2 py-0.5 bg-neo-ink text-neo-bg text-xs font-black uppercase tracking-widest">
                  {type}
                </span>
              </dd>
              <dt className="uppercase tracking-widest text-xs text-black/70">Rarity</dt>
              <dd className="inline-flex">
                <span className="px-2 py-0.5 bg-neo-secondary neo-border border-2 text-xs font-black uppercase tracking-widest">
                  {rarity}
                </span>
              </dd>
              <dt className="uppercase tracking-widest text-xs text-black/70">Attack</dt>
              <dd>{attack}</dd>
              <dt className="uppercase tracking-widest text-xs text-black/70">Defense</dt>
              <dd>{defense}</dd>
              <dt className="uppercase tracking-widest text-xs text-black/70">HP</dt>
              <dd>{hp}</dd>
              <dt className="uppercase tracking-widest text-xs text-black/70">Description</dt>
              <dd>{description || "—"}</dd>
            </dl>
          </div>
        ) : (
          <div className="neo-border bg-neo-secondary/40 p-5 font-black uppercase tracking-widest text-sm">
            Search for a Pokémon and pick a result to load its stats.
          </div>
        )}
      </div>

      {/* RIGHT: preview + big CTA */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="neo-border bg-neo-white neo-shadow-lg p-5 rotate-[-1deg]">
          <div className="text-xs font-black uppercase tracking-widest mb-3 text-black/70">
            Card Preview
          </div>
          <div className="aspect-[5/7] bg-neo-muted/40 neo-border flex items-center justify-center overflow-hidden">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={name || "Preview"}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-black/50 font-black uppercase tracking-widest text-xs">
                <Upload strokeWidth={3} className="h-10 w-10" />
                Pick a card to preview
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="neo-border bg-neo-accent px-4 py-3 font-black uppercase tracking-wide text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="neo-border bg-neo-muted px-4 py-3 font-black uppercase tracking-wide text-sm">
            {success}
          </div>
        )}

        <button
          onClick={handleMint}
          disabled={mounted ? !!(uploading || minting || !hasSelection || !isConnected) : false}
          className="neo-border bg-neo-accent neo-shadow-lg h-16 px-6 font-black uppercase tracking-widest text-xl neo-press disabled:opacity-60 flex items-center justify-center gap-3 rotate-[0.5deg]"
        >
          {!mounted
            ? "Mint Card"
            : !isConnected
              ? "Connect Wallet to Mint"
              : uploading
                ? "Uploading to IPFS…"
                : minting
                  ? waitingForConfirmation
                    ? "Waiting for Confirmation…"
                    : mintPending
                      ? "Confirming…"
                      : "Confirm in Wallet…"
                  : "Mint Card"}
        </button>
      </div>
    </div>
  );
}
