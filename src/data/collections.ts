import { useAxiosClient } from "@/hooks.ts";
import type { Collection, WithId } from "../../shared/types.ts";
import type { CollectionSummary } from "@/types/types.ts";
import { getGameById } from "@/data/games.ts";

export async function getCollectionsByUserId(userId: string) {
  const axiosClient = useAxiosClient();
  const result = await axiosClient.get(`/api/collections/user/${userId}`);
  return result.data as WithId<Collection>[];
}

export async function getCollectionSummariesByUserId(username: string) {
  const collections = await getCollectionsByUserId(username);
  const summaries = [];
  for (const collection of collections) {
    const summary = { _id: collection._id, name: collection.name, gameImages: [] as string[] } as CollectionSummary;
    for (const gameId of collection.gameIds) {
      const game = await getGameById(gameId);
      summary.gameImages.push(game.background_image);
    }
    summaries.push(summary);
  }
  return summaries;
}
