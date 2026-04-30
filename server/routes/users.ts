import { Router } from "express";
import { respondWithError } from "../../shared/errors.ts";
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

router.put("/:username", async (req, res) => {
  try {
    // TODO: Throw an error if someone is trying to update any profile other than their own
    const username = validateString(req.params.username, "Username");
    const profileData = validateProfileData(req.body);
    await updateUserProfile(username, profileData);
    return res.status(200).send();
  } catch (e) {
    return respondWithError(res, e);
  }
});

export default router;
