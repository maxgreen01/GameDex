import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.ts";
import rawgRoutes from "./routes/rawgRoutes.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/games", rawgRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
