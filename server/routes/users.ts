import { Router } from "express";
import { type AuthenticatedRequest, requireAuth } from "../middleware/requireAuth.ts";
import { ForbiddenError, respondWithError } from "../../shared/errors.ts";
import { validateProfileData, validateString } from "../../shared/validation.ts";
import { getUserByUsername, updateUserProfile } from "../data/users.ts";

const router = Router();

router.get("/:username", async (req, res) => {
  try {
    const username = validateString(req.params.username, "Username");
    const user = await getUserByUsername(username);
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
    return res.status(200).send();
  } catch (e) {
    return respondWithError(res, e);
  }
});

export default router;
