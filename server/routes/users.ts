import { Router } from "express";
import { db } from "../firebaseAdmin.ts";

const router = Router();
const usersCollection = db.collection("users");
const reviewsCollection = db.collection("reviews");

//Updates user profile
router.put("/:username", async (req, res) => {
  try {
    let { username } = req.params;
    let { displayName, description } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Missing username" });
    }

    if (!displayName && !description) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    let snapshot = await usersCollection.where("username", "==", username).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    let userDoc = snapshot.docs[0];

    let updates: Record<string, string> = {};
    if (displayName) updates.displayName = displayName.trim();
    if (description) updates.description = description.trim();

    await usersCollection.doc(userDoc.id).update(updates);

    if (displayName) {
      let reviewsSnapshot = await reviewsCollection.where("userId", "==", username).get();
      let batch = db.batch();
      reviewsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { displayName: displayName.trim() });
      });

      await batch.commit();
    }

    return res.json({ success: true, ...updates });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

export default router;
