import { FieldValue } from "firebase-admin/firestore";
import { queryUserByUsername } from "./users.ts";
import { db } from "../firebaseAdmin.ts";
import { NotFoundError } from "../../shared/errors.ts";
import type { Collection, CollectionCreationData, CollectionUpdateData, WithId } from "../../shared/types.ts";

const collections = db.collection("collections");

export async function getCollectionById(id: string) {
  const doc = await collections.doc(id).get();
  if (!doc.exists) throw new NotFoundError("Collection not found");
  return doc.data() as Collection;
}

export async function getCollectionsByUserId(userId: string) {
  const user = await queryUserByUsername(userId);
  if (!user) throw new NotFoundError("User not found");

  const query = await collections.where("userId", "==", userId).get();
  if (query.empty) return [];
  return query.docs.map((doc) => ({ _id: doc.id, ...doc.data() }) as WithId<Collection>);
}

export async function createCollection(userId: string, data: CollectionCreationData) {
  const user = await queryUserByUsername(userId);
  const docRef = await collections.add({ ...data, userId, gameIds: [], createdAt: Date.now() } as Collection);
  await user.ref.update({ collections: FieldValue.arrayUnion(docRef.id) });
  return { message: "Collection created successfully" };
}

export async function updateCollection(id: string, data: CollectionUpdateData) {
  const docRef = collections.doc(id);
  if (!(await docRef.get()).exists) throw new NotFoundError("Collection not found");
  if (data.name) await docRef.update({ name: data.name });
  if (data.gameIdsToAdd) {
    for (const gameId of data.gameIdsToAdd) {
      const gameExists = await fetch(`/api/games/${gameId}`);
      if (!gameExists) throw new NotFoundError("Game not found");
    }

    await docRef.update({ gameIds: FieldValue.arrayUnion(...data.gameIdsToAdd.map(Number)) });
  }
  if (data.gameIdsToRemove) {
    //await docRef.update({ gameIds: FieldValue.arrayRemove(...data.gameIdsToRemove) });
    await docRef.update({ gameIds: FieldValue.arrayRemove(...data.gameIdsToRemove.map(Number)) });
    console.log("removed gameIds:", data.gameIdsToRemove);
    const updated = await docRef.get();
    console.log("gameIds after remove:", updated.data()?.gameIds);
  }
  return { message: "Collection updated successfully" };
}

export async function deleteCollection(id: string) {
  const docRef = collections.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new NotFoundError("Collection not found");
  const collection = doc.data() as Collection;
  await docRef.delete();
  const user = await queryUserByUsername(collection.userId);
  await user.ref.update({ collections: FieldValue.arrayRemove(id) });
  return { message: "Collection removed successfully" };
}
