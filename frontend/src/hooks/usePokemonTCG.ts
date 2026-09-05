"use client";

import { useQuery } from "@tanstack/react-query";
import {
  searchCards,
  getCardById,
  TCGdexCardBrief,
  TCGdexCard,
  PaginatedCards,
  mapRarity,
  calculateAttack,
  calculateDefense,
  calculateHP,
  generateDescription,
  mapType as mapCardType,
} from "../lib/pokemon-tcg";
import { QUERY_KEYS } from "../lib/queryKeys";

export { mapCardType };

export interface PokemonCardSearchResult {
  cards: TCGdexCardBrief[];
  isError: boolean;
  error: Error | null;
}

/**
 * Single-page search — returns the brief array directly (TCGdex card-briefs).
 * Use this when you want a one-shot query without pagination.
 */
export function usePokemonCardSearch(
  query: string,
  enabled: boolean = true
) {
  const q = useQuery({
    queryKey: QUERY_KEYS.POKEMON_CARD_SEARCH(query),
    queryFn: async (): Promise<TCGdexCardBrief[]> => {
      if (!query || query.trim().length === 0) return [];
      const result = await searchCards({ name: query.trim(), itemsPerPage: 20 });
      return result.data;
    },
    enabled: enabled && !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  return {
    data: q.data,
    isFetching: q.isFetching,
    refetch: q.refetch,
  };
}

/**
 * Paginated search — supports `Load more` and infinite-scroll flows.
 */
export function usePokemonCardSearchPaginated(
  query: string,
  page: number,
  itemsPerPage: number = 20,
  enabled: boolean = true
) {
  return useQuery<PaginatedCards>({
    queryKey: ["pokemon-card-search-paged", query, page, itemsPerPage],
    queryFn: async () => {
      if (!query || query.trim().length === 0) {
        return { data: [], page: 1, itemsPerPage };
      }
      return await searchCards({
        name: query.trim(),
        page,
        itemsPerPage,
      });
    },
    enabled: enabled && !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePokemonCardById(cardId: string) {
  return useQuery<TCGdexCard | null>({
    queryKey: QUERY_KEYS.POKEMON_CARD_BY_ID(cardId),
    queryFn: async () => {
      if (!cardId) return null;
      return await getCardById(cardId);
    },
    enabled: !!cardId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export { mapRarity, calculateAttack, calculateDefense, calculateHP, generateDescription };
