import { useEffect, useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  dbReadGenres,
  dbReadManhwasOrderedByUpdateAt,
  dbReadManhwasOrderedByViews,
  dbGetManhwaReadingHistory,
} from "@/lib/database";
import {
  spFetchCollections,
  spFetchRandomManhwaCards,
  spFetchTop10,
} from "@/lib/supabase";
import { useCollectionState } from "@/hooks/collectionsState";
import { useManhwaCardsState } from "@/hooks/randomManhwaState";
import { useTop10ManhwasState } from "@/hooks/top10State";
import { AppConstants } from "@/constants/AppConstants";
import { Genre, Manhwa } from "@/helpers/types";


export function useHomePageData() {
  const db = useSQLiteContext();

  const { cards, setCards } = useManhwaCardsState();
  const { collections, setCollections } = useCollectionState();
  const { top10manhwas, setTop10manhwas } = useTop10ManhwasState();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [latestUpdates, setLatestUpdates] = useState<Manhwa[]>([]);
  const [readingHistory, setReadingHistory] = useState<Manhwa[]>([]);
  const [mostViewed, setMostViewed] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadCards = useCallback(async () => {
    const result = await spFetchRandomManhwaCards(AppConstants.VALIDATION.PAGE_LIMIT);
    setCards(result);
  }, []);

  const reloadTop10 = useCallback(async () => {
    const result = await spFetchTop10();
    setTop10manhwas(result);
  }, []);

  const reloadCollections = useCallback(async () => {
    const result = await spFetchCollections();
    setCollections(result);
  }, []);

  const reloadReadingHistory = useCallback(async () => {
    const result = await dbGetManhwaReadingHistory(
      db,
      0,
      AppConstants.VALIDATION.PAGE_LIMIT
    );
    setReadingHistory(result);
  }, [db]);

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    
    const [g, l, m] = await Promise.all([
      dbReadGenres(db),
      dbReadManhwasOrderedByUpdateAt(db, 0, AppConstants.VALIDATION.PAGE_LIMIT),
      dbReadManhwasOrderedByViews(db, 0, AppConstants.VALIDATION.PAGE_LIMIT),
    ]);

    setGenres(g);
    setLatestUpdates(l);
    setMostViewed(m);

    await Promise.all([
      top10manhwas.length === 0 && reloadTop10(),
      collections.length === 0 && reloadCollections(),
      cards.length === 0 && reloadCards(),
    ]);

    await reloadReadingHistory();

    setLoading(false);
  }, [db]);

  useEffect(() => {
    loadHomeData();
  }, []);

  return {
    genres,
    latestUpdates,
    mostViewed,
    readingHistory,
    top10manhwas,
    collections,
    cards,
    reloadCards,
    reloadTop10,
    reloadCollections,
    reloadReadingHistory,
    loading,
  };
}
