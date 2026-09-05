"use client";

import { useState } from "react";
import type { EnrichedCard } from "../hooks/useCards";
import { toHttpUrl } from "../lib/config";
import { toEth } from "../lib/format";
import BuyButton from "./BuyButton";

export function getRarity(e: EnrichedCard): string {
  const attr = e.metadata?.attributes.find((a) => a.trait_type === "Rarity");
  return attr ? String(attr.value) : "Unknown";
}

export function getType(e: EnrichedCard): string {
  const attr = e.metadata?.attributes.find((a) => a.trait_type === "Type");
  return attr ? String(attr.value) : "Unknown";
}

function normalizeClass(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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

  const rarityClass = normalizeClass(rarity);
  const typeClass = normalizeClass(type);
  const showOverlay = hovered || toggled;

  return (
    <div
      className={`card rarity-${rarityClass} ${showOverlay ? "card-hover" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
      <div className="card-image">
        {metadata?.image && !imgError ? (
          <img
            src={toHttpUrl(metadata.image)}
            alt={metadata?.name ?? "Card"}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-placeholder">{imgError ? "Image unavailable" : "No image"}</div>
        )}
      </div>
      {showOverlay && (
        <div className="card-overlay">
          <div className="card-overlay-content">
            {metadata ? (
              <>
                <h4>{metadata.name || `Card #${tokenId}`}</h4>
                {metadata.description && <p>{metadata.description}</p>}
                <div className="card-overlay-attribs">
                  <span className={`card-overlay-attr badge badge-rarity ${rarityClass}`}>{rarity}</span>
                  <span className={`card-overlay-attr badge badge-type ${typeClass}`}>{type}</span>
                </div>
                <div className="card-overlay-stats">
                  {metadata.attributes
                    ?.filter((a) => ["Attack", "Defense", "HP"].includes(a.trait_type))
                    .map((a) => (
                      <span key={a.trait_type} className="card-overlay-stat">
                        {a.trait_type}: {a.value}
                      </span>
                    ))}
                </div>
              </>
            ) : (
              <h4>{`Card #${tokenId}`}</h4>
            )}
            <div className="card-overlay-actions">
              {listing?.active ? (
                isOwner ? (
                  <button
                    className="btn btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel?.(tokenId);
                    }}
                  >
                    Cancel Listing ({toEth(listing.price)} ETH)
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
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onList(card);
                    }}
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
