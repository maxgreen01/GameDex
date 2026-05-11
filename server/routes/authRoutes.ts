import express from "express";
import { auth, db } from "../services/firebaseAdmin.ts";
import { validateSignup } from "../../shared/validation.ts";
import { addUserToSearchIndex } from "../services/elasticsearch.ts";
import { flushCache } from "../services/redis.ts";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    let { email, password, username, displayName } = validateSignup(req.body);

    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();

    snapshot.forEach((doc) => {
      if (username.toLowerCase() === doc.data().username.toLowerCase()) throw new Error("Username is taken.");
    });

    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    let friends: any[] = [];
    let incomingRequests: string[] = [];
    let outgoingRequests: string[] = [];
    let reviews: any[] = [];
    let collections: any[] = [];
    let privateProfile = false;

    await db.collection("users").doc(userRecord.uid).set({
      username,
      displayName,
      email,
      description: "",
      friends,
      incomingRequests,
      outgoingRequests,
      reviews,
      collections,
      privateProfile,
      createdAt: Date.now(),
    });

    await addUserToSearchIndex({
      username,
      displayName,
      description: "",
    });

    await flushCache();
    return res.status(201).json({ uid: userRecord.uid });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  let { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    const decodedToken = await auth.verifyIdToken(token);

    return res.status(200).json({
      uid: decodedToken.uid,
      email: decodedToken.email,
    });
  } catch (e: any) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
