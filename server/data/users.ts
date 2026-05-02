import { db } from "../firebaseAdmin.ts";
import { NotFoundError } from "../../shared/errors.ts";
import type { ProfileData, User } from "../../shared/types.ts";

const users = db.collection("users");

export async function getUserById(id: string) {
  const doc = await users.doc(id).get();
  if (!doc.exists) throw new NotFoundError("User not found");
  return doc.data() as User;
}

async function queryUserByUsername(username: string) {
  const query = await users.where("username", "==", username).get();
  if (query.empty) throw new NotFoundError("User not found");
  return query;
}

export async function getUserByUsername(username: string) {
  const query = await queryUserByUsername(username);
  return query.docs[0].data() as User;
}

export async function updateUserProfile(username: string, data: ProfileData) {
  const query = await queryUserByUsername(username);
  await query.docs[0].ref.update(data);
}
