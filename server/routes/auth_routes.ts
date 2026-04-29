import express from "express";
import { auth, db } from "../firebaseAdmin.ts";
import { validateSignup, validateLogin } from "../../shared/validation.ts";

const router = express.Router();

router.post("/signup", async (req, res) => {
  let { email, password, username, displayName } = req.body;

  try {
    validateSignup(email, password, username, displayName);

    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();

    snapshot.forEach((doc) => {
      if (username === doc.data().username) throw new Error("Username is taken.");
    });

    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    let friends: any[] = [];
    let pendingInvites: any[] = [];
    let reviews: any[] = [];
    let collections: any[] = [];

    await db.collection("users").doc(userRecord.uid).set({
      username,
      displayName,
      email,
      friends,
      pendingInvites,
      reviews,
      collections,
      createdAt: Date.now(),
    });

    return res.status(201).json({ uid: userRecord.uid });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  let { token, email, password } = req.body;

  try {
    validateLogin(email, password);

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
