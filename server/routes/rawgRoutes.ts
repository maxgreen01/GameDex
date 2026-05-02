import "dotenv/config";
import express from "express";
import axios from "axios";
import { db } from "../firebaseAdmin.ts";
import { generateKey } from "node:crypto";

const router = express.Router();
const apiKey = process.env.RAWG_API_KEY;

const usersCollection = db.collection("users");

if (!apiKey) {
  throw new Error("RAWG_API_KEY is not set");
}

const api = axios.create({
  baseURL: "https://api.rawg.io/api",
  params: {
    key: apiKey,
  },
});

function formatGame(game: any) {
  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    background_image: game.background_image,
    platforms: game.platforms || [],
    rating: game.rating || 0,
    description: game.description_raw || game.description || "",
    genres: game.genres || [],
  };
}

function formatGameResults(data: any) {
  let results = [];

  for (let i = 0; i < data.results.length; i++) {
    results.push(formatGame(data.results[i]));
  }

  return {
    ...data,
    results,
  };
}

async function fetchGames(params: any) {
  const { data } = await api.get("/games", {
    params: {
      page: params.page || 1,
      page_size: 20,
      ...params,
    },
  });

  return formatGameResults(data);
}

router.get("/popular", async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let data = await fetchGames({ ordering: "-added", page });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch popular games" });
  }
});

router.get("/newest", async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let data = await fetchGames({ ordering: "-released", page });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch newest games" });
  }
});

router.get("/recommended/:userId", async (req, res) => {
  try {
    let { userId } = req.params;

    const snapshot = await usersCollection.where("username", "==", userId).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = snapshot.docs[0].data();
    const reviewIds: string[] = userDoc.reviews;
    console.log("All review ID's: ", reviewIds);

    const reviewsCollection = db.collection("reviews");
    const reviewDocs = await Promise.all(reviewIds.map((id) => reviewsCollection.doc(id).get()));

    const reviews = reviewDocs.filter((doc) => doc.exists).map((doc) => doc.data());

    console.log("All reviews:", reviews);

    const goodReviews = reviews.filter((review: any) => review.rating > 3.5).slice(0, 5);

    console.log("Good reviews:", goodReviews);

    if (goodReviews.length === 0) {
      console.log("Hit the fallback!");
      let data = await fetchGames({ ordering: "-added" });
      return res.json(data);
    }

    // get genres for each highly rated game
    const genreCount: Record<string, number> = {};

    await Promise.all(
      goodReviews.map(async (review: any) => {
        try {
          const { data: game } = await api.get(`/games/${review.gameId}`);
          game.genres?.forEach((genre: { name: string; slug: string }) => {
            //for each genre in the specific game, add it to our "counters dictionary"
            genreCount[genre.slug] = (genreCount[genre.slug] ?? 0) + 1; //if its not added, add to list and initialize with 0. else add 1.
          });
        } catch (e) {
          console.error(`Failed to fetch game ${review.gameId}`);
        }
      })
    );

    console.log("Genre Counts: ", genreCount);

    const top3Slugs = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slug]) => slug); //turning the slug from an array into a regular value.

    console.log("Top 3 genres:", top3Slugs);

    const data = await fetchGames({
      genres: top3Slugs.join(","),
      ordering: "-rating",
    }); //fetching games with the top 3 genres, ordering from highest rated.

    return res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch recommended games" });
  }
});

router.get("/outside/:userId", async (req, res) => {
  try {
    let { userId } = req.params;

    const snapshot = await usersCollection.where("username", "==", userId).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = snapshot.docs[0].data();
    const reviewIds: string[] = userDoc.reviews;

    const reviewsCollection = db.collection("reviews");
    const reviewDocs = await Promise.all(reviewIds.map((id) => reviewsCollection.doc(id).get()));

    const reviews = reviewDocs.filter((doc) => doc.exists).map((doc) => doc.data());

    const goodReviews = reviews.filter((review: any) => review.rating > 3.5).slice(0, 5);

    if (goodReviews.length === 0) {
      let data = await fetchGames({ ordering: "-rating" });
      return res.json(data);
    }

    const genreCount: Record<string, number> = {};

    await Promise.all(
      goodReviews.map(async (review: any) => {
        try {
          const { data: game } = await api.get(`/games/${review.gameId}`);
          game.genres?.forEach((genre: { slug: string }) => {
            genreCount[genre.slug] = (genreCount[genre.slug] ?? 0) + 1;
          });
        } catch (e) {
          console.error(`Failed to fetch game ${review.gameId}`);
        }
      })
    );

    const topSlugs = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slug]) => slug);

    const data = await fetchGames({
      ordering: "-rating",
    });

    data.results = data.results.filter((game: any) => {
      //returns all games whos genres do NOT fall in the top 3 genres of the user.
      const gameGenreSlugs = game.genres?.map((g: any) => g.slug) ?? [];
      return !gameGenreSlugs.some((slug: string) => topSlugs.includes(slug));
    });

    return res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch outside games" });
  }
});

router.get("/search", async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let search = String(req.query.search || "");

    let data = await fetchGames({ search, page });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to search games" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data } = await api.get(`/games/${req.params.id}`);
    console.log("Returned data: ", data);
    res.json(formatGame(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

export default router;
