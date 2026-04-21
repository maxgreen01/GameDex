import "dotenv/config";
import express from "express";
import axios from "axios";

const router = express.Router();
const apiKey = process.env.RAWG_API_KEY;

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
    res.json(formatGame(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

export default router;
