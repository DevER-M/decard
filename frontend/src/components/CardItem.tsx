"use client";

import type { EnrichedCard } from "../hooks/useCards";
import { toHttpUrl } from "../lib/config";

export function getRarity(e: EnrichedCard): string {
  const attr = e.metadata?.attributes.find((a) => a.trait_type === "Rarity");
  return attr ? String(attr.value) : "Unknown";
}

export function getType(e: EnrichedCard): string {
  const attr = e.metadata?.attributes.find((a) => a.trait_type === "Type");
  return attr ? String(attr.value) : "Unknown";
}

interface CardItemProps {
  card: EnrichedCard;
  isOwner: boolean;
  onBuy?: (tokenId: bigint, price: bigint) => void;
  onList?: (card: EnrichedCard) => void;
  onCancel?: (tokenId: bigint) => void;
}

export default function CardItem({ card, isOwner, onBuy, onList, onCancel }: CardItemProps) {
  const { tokenId, metadata, listing } = card;
  const rarity = getRarity(card);
  const isListed = listing?.active ?? false;

  return (
    <div className={`card rarity-${rarity.toLowerCase()}`}>
      <div className="card-image">
        {metadata?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={toHttpUrl(metadata.image)} alt={metadata?.name ?? "Card"} />
        ) : (
          <div className="card-placeholder">No image</div>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-name">{metadata?.name ?? `Card #${tokenId.toString()}`}</h3>
        {metadata?.description && <p className="card-desc">{metadata.description}</p>}
        <div className="card-attr">
          <span className={`badge badge-rarity ${rarity.toLowerCase()}`}>{rarity}</span>
          <span className={`badge badge-type ${getType(card).toLowerCase()}`}>
            {getType(card)}
          </span>
        </div>
        <div className="card-stats">
          {metadata?.attributes
            ?.filter((a) => ["Attack", "Defense", "HP"].includes(a.trait_type))
            .map((a) => (
              <span key={a.trait_type} className="stat">
                {a.trait_type}: <strong>{a.value}</strong>
              </span>
            ))}
        </div>
        <div className="card-footer">
          {listing?.active ? (
            <>
              <span className="price">{toEth(listing.price)} ETH</span>
              {isOwner ? (
                <button className="btn btn-secondary" onClick={() => onCancel?.(tokenId)}>
                  Unlist
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => onBuy?.(tokenId, listing.price)}>
                  Buy
                </button>
              )}
            </>
          ) : (
            isOwner && (
              <button className="btn btn-primary" onClick={() => onList?.(card)}>
                List for sale
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function toEth(wei: bigint): string {
  const formatted = Number(wei) / 1e18;
  return formatted.toLocaleString(undefined, { maximumFractionDigits: 4 });
}
