import { db } from "../firebaseAdmin.ts";

const reviewsCollection = db.collection("reviews");

export async function getReviewById(reviewId: string) {
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
    updatedAt: Date.now(),
  };

  let insertedReview = await reviewsCollection.add(newReview);

  return {
    _id: insertedReview.id,
    ...newReview, // This adds each element inside of the newReview object instead of adding each one by one
  };
}

export async function deleteReview(reviewId: string, userId: string) {
  let review = await getReviewById(reviewId);

  if (review.userId !== userId) {
    throw "You cannot delete this review.";
  }

  // deletes the review if the logged in user "owns" it
  await reviewsCollection.doc(reviewId).delete();

  return true;
}

export async function getReviewsByGameId(gameId: string) {
  let snapshot = await reviewsCollection.get();

  let reviews: any[] = [];

  snapshot.forEach((doc) => {
    // only takes reviews matching the game id
    if (doc.data().gameId === gameId) {
      reviews.push({
        _id: doc.id,
        ...doc.data(),
      });
    }
  });

  return reviews;
}

export async function getReviewsByUserId(userId: string) {
  let snapshot = await reviewsCollection.get();

  let reviews: any[] = [];

  snapshot.forEach((doc) => {
    // only stores reviews made by user logged in
    if (doc.data().userId === userId) {
      reviews.push({
        _id: doc.id,
        ...doc.data(),
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
  let review = await getReviewById(reviewId);

  if (review.userId !== userId) {
    throw "You cannot edit this review";
  }

  await reviewsCollection.doc(reviewId).update({
    rating,
    text,
    updatedAt: Date.now(),
  });

  return await getReviewById(reviewId);
}

export async function getReviewByGameIdAndUserId(
  gameId: string,
  userId: string,
) {
  let snapshot = await reviewsCollection.get();

  let foundReview = null;

  snapshot.forEach((doc) => {
    // looks for a review matching both game id and user id
    if (doc.data().gameId === gameId && doc.data().userId === userId) {
      foundReview = {
        _id: doc.id,
        ...doc.data(),
      };
    }
  });

  return foundReview;
}
