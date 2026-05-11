import { Router } from "express";
import { addFriend, declineFriendRequest, getUserByUsername, requestFriend, removeFriend, revokeFriendRequest, updateUserProfile } from "../data/users.ts";
import { type AuthenticatedRequest, optionalAuth, requireAuth } from "../middleware/requireAuth.ts";
import { BadRequestError, ForbiddenError, respondWithError } from "../../shared/errors.ts";
import { validateProfileData, validateString } from "../../shared/validation.ts";
import { searchUsers } from "../services/elasticsearch.ts";
import redisClient, { cacheJSONResponse, deleteJSONCacheKey } from "../services/redis.ts";

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

router.get("/:username", optionalAuth, async (req, res) => {
  try {
    const username = validateString(req.params.username, "Username");
    const currentUser = (req as unknown as AuthenticatedRequest).user;

    // Serve from cache only when the cached profile is public — private profiles
    // must always go through the privacy check because access depends on who's asking
    const cacheKey = req.originalUrl;
    if (await redisClient.exists(cacheKey)) {
      const cached = (await redisClient.json.get(cacheKey)) as Record<string, unknown> | null;
      if (cached && !cached.privateProfile) {
        return res.json(cached);
      }
    }

    const targetUser = await getUserByUsername(username);
    const isSelf = currentUser?.username === username;
    const isFriend = targetUser.friends?.includes(currentUser?.username ?? "");

    if (targetUser.privateProfile && !isSelf && !isFriend) {
      throw new ForbiddenError("This user's profile is private.");
    }

    // Only cache public profiles — a shared URL key can't encode per-requester access rules
    if (!targetUser.privateProfile) {
      await cacheJSONResponse(req, targetUser);
    }

    return res.status(200).json(targetUser);
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
    await deleteJSONCacheKey(`/api/users/${username}`);
    await deleteJSONCacheKey(`/api/reviews/user/${username}`);
    await deleteJSONCacheKey(`/api/collections/user/${username}`);
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
