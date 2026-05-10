import { useAxiosClient } from "../hooks.ts";
import type { ProfileData, User } from "../../shared/types.ts";
import { isAxiosError } from "axios";
import { BadRequestError } from "../../shared/errors.ts";

export async function getCurrentUser() {
  const axiosClient = useAxiosClient();
  const result = await axiosClient.get("/api/users");
  return result.data as User;
}

export async function getUserByUsername(username: string) {
  const axiosClient = useAxiosClient();
  const result = await axiosClient.get(`/api/users/${username}`);
  return result.data as User;
}

export async function updateUserProfile(username: string, data: ProfileData) {
  const axiosClient = useAxiosClient();
  try {
    await axiosClient.put(`/api/users/${username}`, data);
  } catch (e) {
    if (isAxiosError(e)) {
      throw new BadRequestError(e.response?.data?.error ?? "Failed to update profile.");
    }
    throw e;
  }
}
