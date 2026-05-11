import { Router } from "express";
import { createCollection, deleteCollection, getCollectionById, getCollectionsByUserId, updateCollection } from "../data/collections.ts";
import { type AuthenticatedRequest, requireAuth } from "../middleware/requireAuth.ts";
import { ForbiddenError, respondWithError } from "../../shared/errors.ts";
import { validateCollectionCreationData, validateCollectionUpdateData, validateString } from "../../shared/validation.ts";
import { getUserByUsername } from "../data/users.ts";

const router = Router();

//adds a collection?
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.username;
    const data = validateCollectionCreationData(req.body);
    const result = await createCollection(userId, data);
    return res.status(201).json(result);
  } catch (e) {
    return respondWithError(res, e);
  }
});

//get collections by user id
router.get("/user/:userId", requireAuth, async (req, res) => {
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
    return res.status(200).json(collections);
  } catch (e) {
    return respondWithError(res, e);
  }
});

//get collection by id
router.get("/:id", async (req, res) => {
  try {
    const id = validateString(req.params.id, "Collection ID");
    const collection = await getCollectionById(id);
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
    return res.status(201).json(result);
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
    return res.status(204).json(result);
  } catch (e) {
    return respondWithError(res, e);
  }
});

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

export default router;
