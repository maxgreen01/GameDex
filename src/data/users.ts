import type { ProfileData, User } from "../../shared/types.ts";
import axios from "axios";

export async function getUserByUsername(username: string) {
  const result = await axios.get(`/api/users/${username}`);
  return result.data as User;
}

export async function updateUserProfile(username: string, data: ProfileData) {
  await axios.put(`/api/users/${username}`, data);
}
