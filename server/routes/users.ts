import { Router } from "express";
import { addFriend, declineFriendRequest, getUserByUsername, requestFriend, removeFriend, revokeFriendRequest, updateUserProfile } from "../data/users.ts";
import { type AuthenticatedRequest, requireAuth } from "../middleware/requireAuth.ts";
import { BadRequestError, ForbiddenError, respondWithError } from "../../shared/errors.ts";
import { validateProfileData, validateString } from "../../shared/validation.ts";
import { searchUsers } from "../services/elasticsearch.ts";
import { checkCache } from "../middleware/checkCache.ts";
import { cacheJSONResponse, updateCachedJSON } from "../services/redis.ts";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  return res.status(200).json((req as AuthenticatedRequest).user);
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.search as string;

    const result = await searchUsers(query);
    res.status(200).json(result);
  } catch (e) {
    console.error("Error performing search:", e);
    res.status(500).json({ error: e });
  }
});

router.get("/:username", checkCache, async (req, res) => {
  try {
    const username = validateString(req.params.username, "Username");
    const user = await getUserByUsername(username);
    await cacheJSONResponse(req, user);
    return res.status(200).json(user);
  } catch (e) {
    return respondWithError(res, e);
  }
});

router.put("/:username", requireAuth, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const username = validateString(req.params.username, "Username");
    if (username !== user.username) throw new ForbiddenError("A user can only update their own profile");
    const profileData = validateProfileData(req.body);
    await updateUserProfile(username, profileData);
    await updateCachedJSON(`/api/users/${username}`, user);
    return res.status(201).send();
  } catch (e) {
    return respondWithError(res, e);
  }
});

//
// ========== Friend management ==========
//

// Add a friend (accept an incoming request if one exists, or send an outgoing request otherwise)
router.post("/:username/friends/:friendUsername", requireAuth, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const username = validateString(req.params.username, "Username");
    const friendUsername = validateString(req.params.friendUsername, "Friend Username");
    if (username !== user.username) throw new ForbiddenError("A user can only update their own friends");

    if (user.friends?.includes(friendUsername)) throw new BadRequestError("Users are already friends");

    if (user.incomingRequests?.includes(friendUsername)) {
      await addFriend(username, friendUsername);
    } else {
      await requestFriend(username, friendUsername);
    }
    return res.json({ success: true });
  } catch (e) {
    return respondWithError(res, e);
  }
});

// Revoke or decline a friend request (revoke if it's an outgoing request, decline if it's an incoming request)
router.put("/:username/friends/:friendUsername", requireAuth, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const username = validateString(req.params.username, "Username");
    const friendUsername = validateString(req.params.friendUsername, "Friend Username");
    if (username !== user.username) throw new ForbiddenError("A user can only update their own friends");

    if (user.incomingRequests?.includes(friendUsername)) {
      await declineFriendRequest(username, friendUsername);
    } else if (user.outgoingRequests?.includes(friendUsername)) {
      await revokeFriendRequest(username, friendUsername);
    } else {
      throw new BadRequestError("No pending friend request");
    }
    return res.json({ success: true });
  } catch (e) {
    return respondWithError(res, e);
  }
});

// Remove a friend
router.delete("/:username/friends/:friendUsername", requireAuth, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const username = validateString(req.params.username, "Username");
    const friendUsername = validateString(req.params.friendUsername, "Friend Username");
    if (username !== user.username) throw new ForbiddenError("A user can only update their own friends");

    if (!user.friends?.includes(friendUsername)) throw new BadRequestError("Users are not friends");

    await removeFriend(username, friendUsername);

    return res.json({ success: true });
  } catch (e) {
    return respondWithError(res, e);
  }
});

export default router;
