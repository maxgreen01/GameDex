import { useAxiosClient } from "@/hooks.ts";
import type { Game } from "../../shared/types.ts";

export async function getGameById(id: string) {
  const client = useAxiosClient();
  const result = await client.get(`/api/games/${id}`);
  return result.data as Game;
}
