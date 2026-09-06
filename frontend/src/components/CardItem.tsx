"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import type { EnrichedCard } from "../hooks/useCards";
import { toHttpUrl } from "../lib/config";
import { toEth } from "../lib/format";
import BuyButton from "./BuyButton";

export function getRarity(e: EnrichedCard): string {
  const attr = e.metadata?.attributes?.find((a) => a.trait_type === "Rarity");
  return attr ? String(attr.value) : "Unknown";
}

export function getType(e: EnrichedCard): string {
  const attr = e.metadata?.attributes?.find((a) => a.trait_type === "Type");
  return attr ? String(attr.value) : "Unknown";
}

function rarityAccent(rarity: string): string {
  const r = rarity.toLowerCase();
  if (r.includes("legendary") || r.includes("mythical") || r.includes("secret")) return "bg-neo-accent";
  if (r.includes("rare") || r.includes("ultra") || r.includes("holo") || r.includes("vmax") || r.includes("vstar")) return "bg-neo-secondary";
  if (r.includes("uncommon")) return "bg-neo-muted";
  return "bg-neo-white";
}

interface CardItemProps {
  card: EnrichedCard;
  isOwner: boolean;
  onList?: (card: EnrichedCard) => void;
  onCancel?: (tokenId: bigint) => void;
}

export default function CardItem({ card, isOwner, onList, onCancel }: CardItemProps) {
  const { tokenId, metadata, listing } = card;
  const rarity = getRarity(card);
  const type = getType(card);
  const [hovered, setHovered] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showOverlay = hovered || toggled;
  const accentBg = rarityAccent(rarity);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={[
          "relative neo-border bg-neo-white neo-lift",
          "shadow-[8px_8px_0_0_#000] group-hover:shadow-[12px_12px_0_0_#000]",
          "-rotate-1 group-hover:rotate-0 transition-transform duration-200",
        ].join(" ")}
        onClick={() => setToggled((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setToggled((v) => !v);
          }
        }}
      >
        {/* Top-left rarity sticker */}
        <div
          className={[
            "absolute -top-3 -left-3 z-10 inline-flex items-center gap-1",
            "px-2 py-1 neo-border bg-neo-white text-[11px] font-black uppercase tracking-widest",
            "rotate-[-6deg] shadow-[3px_3px_0_0_#000]",
          ].join(" ")}
        >
          <svg className="h-3 w-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {rarity}
        </div>

        {/* Top-right type badge */}
        <div
          className={[
            "absolute -top-3 -right-3 z-10",
            "px-2 py-1 neo-border text-[11px] font-black uppercase tracking-widest",
            `${accentBg} rotate-[5deg] shadow-[3px_3px_0_0_#000]`,
          ].join(" ")}
        >
          {type}
        </div>

        {/* Card image */}
        <div className="aspect-[5/7] bg-neo-muted/30 flex items-center justify-center overflow-hidden border-b-4 border-black">
          {metadata?.image && !imgError ? (
            <img
              src={toHttpUrl(metadata.image)}
              alt={metadata?.name ?? "Card"}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-black/60 font-black uppercase tracking-widest text-sm">
              {imgError ? "Image unavailable" : "No image"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-3 bg-neo-white flex flex-col gap-1">
          <div className="font-black uppercase tracking-tight text-base truncate">
            {metadata?.name ?? `Card #${tokenId.toString()}`}
          </div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-black/70">
            <span>#{tokenId.toString()}</span>
            {listing?.active ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neo-accent neo-border border-2 text-black">
                <Tag strokeWidth={3} className="h-3 w-3" />
                {toEth(listing.price)} ETH
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neo-bg neo-border border-2 text-black/60">
                Unlisted
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overlay on hover/tap */}
      {showOverlay && (
        <div
          className={[
            "absolute inset-0 z-20 flex items-center justify-center p-3",
            "bg-neo-secondary/95 neo-border border-4 rotate-0",
            "shadow-[10px_10px_0_0_#000]",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full text-center flex flex-col gap-3">
            <div className="bg-neo-ink text-neo-bg inline-block px-3 py-1 mx-auto font-black uppercase tracking-widest text-sm neo-border border-4 border-neo-ink rotate-[-2deg]">
              #{tokenId.toString()}
            </div>
            {metadata && (
              <>
                <h4 className="font-black uppercase tracking-tight text-lg leading-tight">
                  {metadata.name}
                </h4>
                {metadata.description && (
                  <p className="text-xs font-bold leading-snug line-clamp-3">
                    {metadata.description}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-2">
                  {metadata.attributes
                    ?.filter((a) => ["Attack", "Defense", "HP"].includes(a.trait_type))
                    .map((a) => (
                      <span
                        key={a.trait_type}
                        className="px-2 py-0.5 bg-neo-white neo-border border-2 text-[11px] font-black uppercase tracking-widest"
                      >
                        {a.trait_type}: {a.value}
                      </span>
                    ))}
                </div>
              </>
            )}
            <div className="pt-2">
              {listing?.active ? (
                isOwner ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel?.(tokenId);
                    }}
                    className="neo-border bg-neo-white px-4 py-2 font-black uppercase text-sm tracking-widest neo-press-sm"
                  >
                    Cancel {toEth(listing.price)} ETH
                  </button>
                ) : (
                  <div onClick={(e) => e.stopPropagation()}>
                    <BuyButton tokenId={tokenId} price={listing.price} />
                  </div>
                )
              ) : (
                isOwner &&
                onList && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onList(card);
                    }}
                    className="neo-border bg-neo-accent px-4 py-2 font-black uppercase text-sm tracking-widest neo-press-sm"
                  >
                    List for Sale
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}