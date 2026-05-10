import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../services/firebaseAdmin.ts";
import { requireAuth } from "../middleware/requireAuth.ts";
import { checkCache } from "../middleware/checkCache.ts";
import { appendCachedJSONArray, cacheJSONResponse, deleteCacheKey, updateCachedJSON } from "../services/redis.ts";
import type { RedisJSON } from "redis";

const router = Router();

const reviewsCollection = db.collection("reviews");
const usersCollection = db.collection("users");

//same thing as getReviewById
router.get("/:reviewId", checkCache, async (req, res) => {
  try {
    let { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({ error: "Missing args" });
    }

    if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid review id" });
    }

    reviewId = reviewId.trim();

    let reviewDoc = await reviewsCollection.doc(reviewId).get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review not found." });
    }

    let data = reviewDoc.data() as any;
    const review = {
      _id: reviewDoc.id,
      gameId: data.gameId,
      userId: data.userId,
      displayName: data.displayName,
      rating: data.rating,
      text: data.text,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    await cacheJSONResponse(req, review);
    return res.json(review);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

// same as createReview()
router.post("/", requireAuth, async (req, res) => {
  try {
    let { gameId, userId, rating, text, displayName } = req.body;

    if (!gameId || !userId || rating === undefined || !text) {
      return res.status(400).json({ error: "Missing args" });
    }

    if (typeof gameId !== "string" || gameId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid game id" });
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (typeof displayName !== "string" || displayName.trim().length === 0) {
      return res.status(400).json({ error: "Invalid displayName" });
    }

    if (typeof rating !== "number" || rating > 5) {
      return res.status(400).json({ error: "Invalid rating" });
    }

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Invalid review text" });
    }

    gameId = gameId.trim();
    userId = userId.trim();
    text = text.trim();
    displayName = displayName.trim();

    const userDoc = await usersCollection.where("username", "==", userId).get();

    if (userDoc.empty) {
      return res.status(404).json({ error: `User not found.` });
    }

    // checks if this user already reviewed this game
    let snapshot = await reviewsCollection.get();
    let existingReview = null;

    snapshot.forEach((doc) => {
      let review = doc.data();
      if (review.gameId === gameId && review.userId === userId) {
        existingReview = doc.id;
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: "You already reviewed this game." });
    }

    let newReview = {
      gameId,
      displayName,
      userId,
      rating,
      text,
      createdAt: Date.now(),
      updatedAt: null,
    };

    let insertedReview = await reviewsCollection.add(newReview);

    // stores the new review id inside the user's reviews array
    const userDocId = userDoc.docs[0].id;

    await usersCollection.doc(userDocId).update({
      reviews: FieldValue.arrayUnion(insertedReview.id),
    });

    const returnedReview = {
      _id: insertedReview.id,
      gameId: newReview.gameId,
      displayName: newReview.displayName,
      userId: newReview.userId,
      rating: newReview.rating,
      text: newReview.text,
      createdAt: newReview.createdAt,
      updatedAt: newReview.updatedAt,
    };

    await updateCachedReview(returnedReview, true);
    return res.status(201).json();
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

// same as deleteReview
router.delete("/:reviewId", requireAuth, async (req, res) => {
  try {
    let { reviewId } = req.params;
    let { userId } = req.body;

    if (!reviewId || !userId) {
      return res.status(400).json({ error: "Missing args" });
    }

    if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid review id" });
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    reviewId = reviewId.trim();
    userId = userId.trim();

    let reviewDoc = await reviewsCollection.doc(reviewId).get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review not found." });
    }

    let review = reviewDoc.data() as any;

    if (review.userId !== userId) {
      return res.status(403).json({ error: "You cannot delete this review." });
    }

    // removes the review id from the user's reviews array
    const userSnapshot = await usersCollection.where("username", "==", userId).get();
    const userDocId = userSnapshot.docs[0].id;

    await usersCollection.doc(userDocId).update({
      reviews: FieldValue.arrayRemove(reviewId),
    });

    // deletes the review
    await reviewsCollection.doc(reviewId).delete();

    // fixme(MG) cache update
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

// same as getReviewsByGameId
router.get("/game/:gameId", checkCache, async (req, res) => {
  try {
    let { gameId } = req.params;

    if (!gameId) {
      return res.status(400).json({ error: "Missing args" });
    }

    if (typeof gameId !== "string" || gameId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid game id" });
    }

    gameId = gameId.trim();

    let snapshot = await reviewsCollection.get();
    let reviews: any[] = [];

    snapshot.forEach((doc) => {
      let review = doc.data();

      if (review.gameId === gameId) {
        reviews.push({
          _id: doc.id,
          gameId: review.gameId,
          displayName: review.displayName,
          userId: review.userId,
          rating: review.rating,
          text: review.text,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        });
      }
    });

    await cacheJSONResponse(req, reviews);
    return res.json(reviews);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

// same as getReviewsByUserId
router.get("/user/:userId", checkCache, async (req, res) => {
  try {
    let { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Missing args" });
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    userId = userId.trim();

    let snapshot = await reviewsCollection.get();
    let reviews: any[] = [];

    snapshot.forEach((doc) => {
      let review = doc.data();

      if (review.userId === userId) {
        reviews.push({
          _id: doc.id,
          gameId: review.gameId,
          userId: review.userId,
          displayName: review.displayName,
          rating: review.rating,
          text: review.text,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        });
      }
    });

    await cacheJSONResponse(req, reviews);
    return res.json(reviews);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

// same as editReviews
router.put("/:reviewId", requireAuth, async (req, res) => {
  try {
    let { reviewId } = req.params;
    let { userId, rating, text } = req.body;

    if (!reviewId || !userId || rating === undefined || !text) {
      return res.status(400).json({ error: "Missing args" });
    }

    if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid review id" });
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (typeof rating !== "number" || rating > 5) {
      return res.status(400).json({ error: "Invalid rating" });
    }

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Invalid review text" });
    }

    reviewId = reviewId.trim();
    userId = userId.trim();
    text = text.trim();

    let reviewDoc = await reviewsCollection.doc(reviewId).get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: "Review not found." });
    }

    let review = reviewDoc.data() as any;

    if (review.userId !== userId) {
      return res.status(403).json({ error: "You cannot edit this review." });
    }

    let updatedAt = Date.now();

    await reviewsCollection.doc(reviewId).update({
      rating,
      text,
      updatedAt,
    });

    const updatedReview = {
      _id: reviewId,
      gameId: review.gameId,
      userId: review.userId,
      displayName: review.displayName,
      rating,
      text,
      createdAt: review.createdAt,
      updatedAt,
    };

    await updateCachedReview(updatedReview, false);
    return res.json(updatedReview);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

// same as getReviewByGameIdAndUserId
router.get("/game/:gameId/user/:userId", checkCache, async (req, res) => {
  try {
    let { gameId, userId } = req.params;

    if (!gameId || !userId) {
      return res.status(400).json({ error: "Missing args" });
    }

    if (typeof gameId !== "string" || gameId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid game id" });
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    gameId = gameId.trim();
    userId = userId.trim();

    let snapshot = await reviewsCollection.get();
    let foundReview = null;

    snapshot.forEach((doc) => {
      let review = doc.data();

      if (review.gameId === gameId && review.userId === userId) {
        foundReview = {
          _id: doc.id,
          gameId: review.gameId,
          userId: review.userId,
          rating: review.rating,
          text: review.text,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        };
      }
    });

    await cacheJSONResponse(req, foundReview);
    return res.json(foundReview);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

// same as getReviewsExcludingUser()
router.get("/game/:gameId/excluding/:userId", checkCache, async (req, res) => {
  try {
    let { gameId, userId } = req.params;

    if (!gameId || !userId) {
      return res.status(400).json({ error: "Missing args" });
    }

    if (typeof gameId !== "string" || gameId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid game id" });
    }

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    gameId = gameId.trim();
    userId = userId.trim();

    let usersSnapshot = await usersCollection.get();
    let reviews: any[] = [];

    for (const userDoc of usersSnapshot.docs) {
      let userData = userDoc.data();
      if (userData.username === userId) continue;
      let reviewIds: string[] = userData.reviews || [];

      for (const reviewId of reviewIds) {
        let reviewDoc = await reviewsCollection.doc(reviewId).get();

        if (!reviewDoc.exists) continue;

        let review = reviewDoc.data() as any;

        if (review.gameId !== gameId) continue;

        reviews.push({
          _id: reviewDoc.id,
          gameId: review.gameId,
          userId: review.userId,
          rating: review.rating,
          text: review.text,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          displayName: review.displayName,
        });
      }
    }

    await cacheJSONResponse(req, reviews);
    return res.json(reviews);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

// update all the relevant Redis cache entries for when a review is added or updated
async function updateCachedReview(review: any, isNew: boolean) {
  const reviewId = review._id;
  const gameId = review.gameId;
  const userId = review.userId;
  if (!reviewId || !gameId || !userId) return;
  const reviewObj = review as RedisJSON;

  // replace this review's own cache entry
  await updateCachedJSON(`/api/reviews/${reviewId}`, reviewObj);
  await updateCachedJSON(`/api/reviews/game/${gameId}/user/${userId}`, reviewObj);

  // append this review to all the relevant cached arrays
  if (isNew) {
    await appendCachedJSONArray(`/api/reviews/game/${gameId}`, "", reviewObj);
    await appendCachedJSONArray(`/api/reviews/user/${userId}`, "", reviewObj);
    await appendCachedJSONArray(`/api/users/${userId}`, "reviews", reviewId);
  }

  // This is unfortunately slow, but the user might notice if the ratings on the front page games don't change.
  // This forcibly refreshes all of them
  await deleteCacheKey(`/api/games/${gameId}`);
  await deleteCacheKey("/api/games/popular");
  await deleteCacheKey("/api/games/newest"); // todo this could be sped up by modifying the review field of the affected game instead of deleting
  await deleteCacheKey(`/api/games/recommended/${userId}`);
  await deleteCacheKey(`/api/games/outside/${userId}`);
}

export default router;
