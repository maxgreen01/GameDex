import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.ts";
import collectionRoutes from "./routes/collections.ts";
import rawgRoutes from "./routes/rawgRoutes.ts";
import reviewRoutes from "./routes/reviews.ts";
import userRoutes from "./routes/users.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/games", rawgRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
