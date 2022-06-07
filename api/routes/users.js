import express from "express";
import { body } from "express-validator";
import User from "../controllers/userController.js";

const router = express.Router();
const userController = new User();

router.get("/list", (...args) => userController.listUser(...args));

router.post(
  "/add",
  body("first_name").isLength({ min: 2 }),
  body("last_name").isLength({ min: 2 }),
  body("gf_type").isLength({ min: 2 }),
  body("email").isEmail(),
  (...args) => userController.addUser(...args)
);

router.delete("/delete", body("token").isUUID(), (...args) =>
  userController.deleteUser(...args)
);

export default router;
