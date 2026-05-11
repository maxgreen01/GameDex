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
    const summary = {
      _id: collection._id,
      name: collection.name,
      userId: collection.userId,
      games: [] as { gameId: string; gameImage: string }[],
    } as CollectionSummary;
    for (const gameId of collection.gameIds) {
      const game = await getGameById(gameId);
      let gameInfo = {
        gameId: gameId,
        gameImage: game.background_image,
      };
      summary.games.push(gameInfo);
    }
    summaries.push(summary);
  }
  console.log("fetched collections:", collections);
  return summaries;
}

export async function updateCollection(newTitle: string, collectionId: string, gameIdsToAdd: string[], gameIdsToRemove: string[]) {
  const axiosClient = useAxiosClient();
  let data = {
    name: newTitle,
    gameIdsToAdd: gameIdsToAdd.length == 0 ? null : gameIdsToAdd.map(String),
    gameIdsToRemove: gameIdsToRemove.length == 0 ? null : gameIdsToRemove.map(String),
  };
  const result = await axiosClient.post(`/api/collections/${collectionId}`, data);
  return result;
}

export async function deleteCollection(id: string) {
  const axiosClient = useAxiosClient();
  const result = await axiosClient.delete(`/api/collections/${id}`);
  return result;
}

export async function addCollection(collectionTitle: string) {
  const axiosClient = useAxiosClient();
  const result = await axiosClient.post(`/api/collections/`, { name: collectionTitle });
  return result;
}

export async function getCollectionsByUserTooAdd(gameId: string) {
  const axiosClient = useAxiosClient();
  const result = await axiosClient.get(`/api/collections/addToCollection/${gameId}`);
  return result.data as CollectionSummary[];
}
