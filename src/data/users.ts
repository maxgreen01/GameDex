import { useAxiosClient } from "../hooks.ts";
import type { ProfileData, User } from "../../shared/types.ts";

export async function getUserByUsername(username: string) {
  const axiosClient = useAxiosClient();
  const result = await axiosClient.get(`/api/users/${username}`);
  return result.data as User;
}

export async function updateUserProfile(username: string, data: ProfileData) {
  const axiosClient = useAxiosClient();
  await axiosClient.put(`/api/users/${username}`, data);
}
