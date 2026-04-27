import { FieldValue } from "firebase-admin/firestore"; // Good functionality (handles duplicates etc)
import { db } from "../firebaseAdmin.ts";

const reviewsCollection = db.collection("reviews");
const usersCollection = db.collection("users");

export async function getReviewById(reviewId: string) {
  if (!reviewId) {
    throw "Missing args";
  }

  if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
    throw "Invalid review id";
  }

  reviewId = reviewId.trim();

  let reviewDoc = await reviewsCollection.doc(reviewId).get();

  if (!reviewDoc.exists) {
    throw "Review not found.";
  }

  let review = reviewDoc.data() as any;

  return {
    _id: reviewDoc.id,
    gameId: review.gameId,
    userId: review.userId,
    rating: review.rating,
    text: review.text,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

export async function createReview(
  gameId: string,
  userId: string,
  rating: number,
  text: string,
) {
  if (!gameId || !userId || rating === undefined || !text) {
    throw "Missing args";
  }

  if (typeof gameId !== "string" || gameId.trim().length === 0) {
    throw "Invalid game id";
  }

  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw "Invalid user id";
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw "Invalid rating";
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    throw "Invalid review text";
  }

  gameId = gameId.trim();
  userId = userId.trim();
  text = text.trim();

  let userDoc = await usersCollection.doc(userId).get();

  if (!userDoc.exists) {
    throw "User not found.";
  }

  // checks if this user already reviewed this game
  let existingReview = await getReviewByGameIdAndUserId(gameId, userId);

  if (existingReview) {
    throw "You already reviewed this game.";
  }

  let newReview = {
    gameId,
    userId,
    rating,
    text,
    createdAt: Date.now(),
    updatedAt: null, // Initializing this as null as its being created, not updated
  };

  let insertedReview = await reviewsCollection.add(newReview);

  // stores the new review id inside the user's reviews array
  await usersCollection.doc(userId).update({
    reviews: FieldValue.arrayUnion(insertedReview.id), // does not add duplicates
  });

  return {
    _id: insertedReview.id,
    gameId: newReview.gameId,
    userId: newReview.userId,
    rating: newReview.rating,
    text: newReview.text,
    createdAt: newReview.createdAt,
    updatedAt: newReview.updatedAt,
  };
}

export async function deleteReview(reviewId: string, userId: string) {
  if (!reviewId || !userId) {
    throw "Missing args";
  }

  if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
    throw "Invalid review id";
  }

  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw "Invalid user id";
  }

  reviewId = reviewId.trim();
  userId = userId.trim();

  let review = await getReviewById(reviewId);

  if (review.userId !== userId) {
    throw "You cannot delete this review.";
  }

  // removes the review id from the user's reviews array
  await usersCollection.doc(userId).update({
    reviews: FieldValue.arrayRemove(reviewId),
  });

  // deletes the review if the logged in user "owns" it
  await reviewsCollection.doc(reviewId).delete();

  return true;
}

export async function getReviewsByGameId(gameId: string) {
  if (!gameId) {
    throw "Missing args";
  }

  if (typeof gameId !== "string" || gameId.trim().length === 0) {
    throw "Invalid game id";
  }

  gameId = gameId.trim();

  let snapshot = await reviewsCollection.get();

  let reviews: any[] = [];

  snapshot.forEach((doc) => {
    let review = doc.data();

    // only takes reviews matching the game id
    if (review.gameId === gameId) {
      reviews.push({
        _id: doc.id,
        gameId: review.gameId,
        userId: review.userId,
        rating: review.rating,
        text: review.text,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      });
    }
  });

  return reviews;
}

export async function getReviewsByUserId(userId: string) {
  if (!userId) {
    throw "Missing args";
  }

  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw "Invalid user id";
  }

  userId = userId.trim();

  let snapshot = await reviewsCollection.get();

  let reviews: any[] = [];

  snapshot.forEach((doc) => {
    let review = doc.data();

    // only stores reviews made by user logged in
    if (review.userId === userId) {
      reviews.push({
        _id: doc.id,
        gameId: review.gameId,
        userId: review.userId,
        rating: review.rating,
        text: review.text,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      });
    }
  });

  return reviews;
}

export async function editReview(
  reviewId: string,
  userId: string,
  rating: number,
  text: string,
) {
  if (!reviewId || !userId || rating === undefined || !text) {
    throw "Missing args";
  }

  if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
    throw "Invalid review id";
  }

  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw "Invalid user id";
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw "Invalid rating";
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    throw "Invalid review text";
  }

  reviewId = reviewId.trim();
  userId = userId.trim();
  text = text.trim();

  let review = await getReviewById(reviewId);

  if (review.userId !== userId) {
    throw "You cannot edit this review.";
  }

  let updatedAt = Date.now();

  await reviewsCollection.doc(reviewId).update({
    rating,
    text,
    updatedAt,
  });

  return {
    _id: reviewId,
    gameId: review.gameId,
    userId: review.userId,
    rating,
    text,
    createdAt: review.createdAt,
    updatedAt,
  };
}

export async function getReviewByGameIdAndUserId(
  gameId: string,
  userId: string,
) {
  if (!gameId || !userId) {
    throw "Missing args";
  }

  if (typeof gameId !== "string" || gameId.trim().length === 0) {
    throw "Invalid game id";
  }

  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw "Invalid user id";
  }

  gameId = gameId.trim();
  userId = userId.trim();

  let snapshot = await reviewsCollection.get();

  let foundReview = null;

  snapshot.forEach((doc) => {
    let review = doc.data();

    // looks for a review matching both game id and user id
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

  return foundReview;
}
