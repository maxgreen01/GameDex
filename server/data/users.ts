import { db } from "../firebaseAdmin.ts";
import { BadRequestError, NotFoundError } from "../../shared/errors.ts";
import type { ProfileData, User } from "../../shared/types.ts";
import { FieldValue } from "firebase-admin/firestore";
import { updateUserInSearchIndex } from "../elasticsearch.ts";

const users = db.collection("users");

export async function getUserById(id: string) {
  const doc = await users.doc(id).get();
  if (!doc.exists) throw new NotFoundError("User not found");
  return doc.data() as User;
}

export async function queryUserByUsername(username: string) {
  const query = await users.where("username", "==", username).get();
  if (query.empty) throw new NotFoundError("User not found");
  return query.docs[0];
}

export async function getUserByUsername(username: string) {
  const query = await queryUserByUsername(username);
  return query.data() as User;
}

export async function updateUserProfile(username: string, data: ProfileData) {
  const query = await queryUserByUsername(username);
  await query.ref.update(data);
  await updateUserInSearchIndex(data);
}

//
// ========== Friend management ==========
//

// Send a friend request from username to friendUsername
export async function requestFriend(username: string, friendUsername: string) {
  if (username === friendUsername) throw new BadRequestError("You cannot send a friend request to yourself!");
  const userDoc = await queryUserByUsername(username);
  const friendDoc = await queryUserByUsername(friendUsername);
  await userDoc.ref.update({
    outgoingRequests: FieldValue.arrayUnion(friendUsername),
  });
  await friendDoc.ref.update({
    incomingRequests: FieldValue.arrayUnion(username),
  });
}

// Revoke an outgoing friend request, which also removes the corresponding incoming request
export async function revokeFriendRequest(username: string, friendUsername: string) {
  if (username === friendUsername) throw new BadRequestError("You cannot revoke a friend request to yourself!");
  const userDoc = await queryUserByUsername(username);
  const friendDoc = await queryUserByUsername(friendUsername);
  await userDoc.ref.update({
    outgoingRequests: FieldValue.arrayRemove(friendUsername),
  });
  await friendDoc.ref.update({
    incomingRequests: FieldValue.arrayRemove(username),
  });
}

// Decline an incoming friend request, leaving the outgoing request intact (to avoid showing the declined request)
export async function declineFriendRequest(username: string, friendUsername: string) {
  if (username === friendUsername) throw new BadRequestError("You cannot decline a friend request from yourself!");
  const userDoc = await queryUserByUsername(username);
  const friendDoc = await queryUserByUsername(friendUsername);
  await userDoc.ref.update({
    incomingRequests: FieldValue.arrayRemove(friendUsername),
  });
}

// Accept a friend request, clearing any existing requests between the two users
export async function addFriend(username: string, friendUsername: string) {
  if (username === friendUsername) throw new BadRequestError("You cannot add yourself as a friend!");
  const userDoc = await queryUserByUsername(username);
  const friendDoc = await queryUserByUsername(friendUsername);
  await userDoc.ref.update({
    friends: FieldValue.arrayUnion(friendUsername),
    outgoingRequests: FieldValue.arrayRemove(friendUsername),
    incomingRequests: FieldValue.arrayRemove(friendUsername),
  });
  await friendDoc.ref.update({
    friends: FieldValue.arrayUnion(username),
    outgoingRequests: FieldValue.arrayRemove(username),
    incomingRequests: FieldValue.arrayRemove(username),
  });
}

// Remove a friend
export async function removeFriend(username: string, friendUsername: string) {
  if (username === friendUsername) throw new BadRequestError("You cannot remove yourself as a friend!");
  const userDoc = await queryUserByUsername(username);
  const friendDoc = await queryUserByUsername(friendUsername);
  await userDoc.ref.update({
    friends: FieldValue.arrayRemove(friendUsername),
  });
  await friendDoc.ref.update({
    friends: FieldValue.arrayRemove(username),
  });
}
