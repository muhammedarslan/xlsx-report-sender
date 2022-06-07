import express from "express";
import Auth from "../controllers/authController.js";

const router = express.Router();
const authController = new Auth();

router.post("/login", (...args) => authController.login(...args));
router.get("/token", (...args) => authController.checkToken(...args));

export default router;
