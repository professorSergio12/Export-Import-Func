import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectionDB from "./config/db.js";
import importRoutes from "./routes/import.routes.js";
import exportRoutes from "./routes/export.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


connectionDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
}));

// Routes
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/api/import", importRoutes);
app.use("/api/export", exportRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 