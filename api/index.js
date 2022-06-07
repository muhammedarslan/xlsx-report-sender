import env from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Auth from "./controllers/authController.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import settingsRoutes from "./routes/settings.js";
import jobRoutes from "./routes/jobs.js";

// Set .env
env.config({
  path: path.resolve() + "\\..\\.env",
});

// Start express
const app = express();
const auth = new Auth();

// Cors && Private network access
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Request-Private-Network", "true");
  next();
});

// Bodyparser middleware
app.use(bodyParser.json());

// Api routes
app.use("/auth", authRoutes);
app.use("/users", (...args) => auth.authMiddleware(...args), userRoutes);
app.use("/settings", (...args) => auth.authMiddleware(...args), settingsRoutes);
app.use("/jobs", (...args) => auth.authMiddleware(...args), jobRoutes);

// Listen port
app.listen(process.env.expressPort, () => {
  console.log(`Api listening on port ${process.env.expressPort}`);
});
