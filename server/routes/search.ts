import { Router } from "express";
import { searchUsers } from "../elasticsearch";

const router = Router();

// router.get("/ping", async (req, res) => {
//   try {
//     console.log("Pinging Elasticsearch...");
//     const result = await esClient.info();
//
//     res.status(200).json(result);
//   } catch (e) {
//     console.error("Error getting Elasticsearch info:", e);
//
//     res.status(500).json({ error: e });
//   }
// });

router.get("/users", async (req, res) => {
  try {
    const query = req.query.search as string;

    const result = await searchUsers(query);
    res.status(200).json(result);
  } catch (e) {
    console.error("Error performing search:", e);
    res.status(500).json({ error: e });
  }
});

export default router;
