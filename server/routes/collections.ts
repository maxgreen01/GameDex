import { Router } from "express";
import { createCollection, deleteCollection, getCollectionById, getCollectionsByUserId, updateCollection } from "../data/collections.ts";
import { type AuthenticatedRequest, requireAuth } from "../middleware/requireAuth.ts";
import { ForbiddenError, respondWithError } from "../../shared/errors.ts";
import { validateCollectionCreationData, validateCollectionUpdateData, validateString } from "../../shared/validation.ts";
import { checkCache } from "../middleware/checkCache.ts";
import { appendToCachedJSONArray, cacheJSONResponse, deleteJSONCacheKey, removeFromCachedJSONArray, updateCachedJSON } from "../services/redis.ts";
import type { RedisJSON } from "redis";
import { getUserByUsername } from "../data/users.ts";

const router = Router();

//adds a collection?
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.username;
    const data = validateCollectionCreationData(req.body);
    const result = await createCollection(userId, data);
    await updateCachedCollection(result, "create");
    return res.status(201).json({ message: "Collection created successfully" });
  } catch (e) {
    return respondWithError(res, e);
  }
});

//get collections by user id
router.get("/user/:userId", requireAuth, checkCache, async (req, res) => {
  try {
    const userId = validateString(req.params.userId, "User ID");
    const currentUser = (req as AuthenticatedRequest).user;
    const targetUser = await getUserByUsername(userId);

    const isSelf = currentUser.username === userId;
    const isFriend = targetUser.friends?.includes(currentUser.username);

    if (targetUser.privateProfile && !isSelf && !isFriend) {
      throw new ForbiddenError("This user's collections are private.");
    }
    const collections = await getCollectionsByUserId(userId);
    await cacheJSONResponse(req, collections);
    return res.status(200).json(collections);
  } catch (e) {
    return respondWithError(res, e);
  }
});

//get collection by id
router.get("/:id", checkCache, async (req, res) => {
  try {
    const id = validateString(req.params.id, "Collection ID");
    const collection = await getCollectionById(id);
    await cacheJSONResponse(req, collection);
    return res.status(200).json(collection);
  } catch (e) {
    return respondWithError(res, e);
  }
});

//updates collection
router.post("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.username;
    const id = validateString(req.params.id, "Collection ID");
    const collection = await getCollectionById(id);
    if (userId !== collection.userId) throw new ForbiddenError("A user can only update their own collections");
    const data = validateCollectionUpdateData(req.body);
    const result = await updateCollection(id, data);
    await updateCachedCollection(result, "update");
    return res.status(201).json({ message: "Collection updated successfully" });
  } catch (e) {
    return respondWithError(res, e);
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.username;
    const id = validateString(req.params.id, "Collection ID");
    const collection = await getCollectionById(id);
    if (userId !== collection.userId) throw new ForbiddenError("A user can only delete their own collections");
    const result = await deleteCollection(id);
    await updateCachedCollection(result, "delete");
    return res.status(204).json({ message: "Collection deleted successfully" });
  } catch (e) {
    return respondWithError(res, e);
  }
});

// don't cache this because it depends on the logged in user, not the query params
router.get("/addToCollection/:gameId", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.username;
    let gameId = validateString(req.params.gameId, "addToCollection gameId");

    let collections = await getCollectionsByUserId(userId);
    let filteredCollections = [];

    for (let i = 0; i < collections.length; i++) {
      if (!collections[i].gameIds.map(String).includes(gameId)) {
        filteredCollections.push(collections[i]);
      }
    }

    return res.status(200).json(filteredCollections);
  } catch (e) {
    return respondWithError(res, e);
  }
});

// update all the relevant Redis cache entries for when a collection is added or updated
async function updateCachedCollection(collection: any, action: "create" | "update" | "delete") {
  console.log("Updating cached collection, action:", action, "collection:", collection);
  const collectionId = collection._id;
  const userId = collection.userId;
  if (!collectionId || !userId) {
    console.error("Collection object is missing _id or userId:", collection);
    return;
  }
  const collectionObj = collection as RedisJSON;

  // replace this collection's own cache entry
  if (action === "create" || action === "update") {
    await updateCachedJSON(`/api/collections/${collectionId}`, collectionObj);
  } else if (action === "delete") {
    await deleteJSONCacheKey(`/api/collections/${collectionId}`);
  }

  // append this collection to all the relevant cached arrays
  if (action === "create") {
    await appendToCachedJSONArray(`/api/collections/user/${userId}`, "", collectionObj);
    await appendToCachedJSONArray(`/api/users/${userId}`, "collections", collectionId);
  } else if (action === "update" || action === "delete") {
    // instead of trying to update the object in the array (which has issues), just refresh the route regardless
    await deleteJSONCacheKey(`/api/collections/user/${userId}`);
    await deleteJSONCacheKey(`/api/users/${userId}`, "collections");
  }
}

export default router;
