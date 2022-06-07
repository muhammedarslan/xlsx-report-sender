import express from "express";
import { body } from "express-validator";
import Settings from "../controllers/settingController.js";

const router = express.Router();
const settingController = new Settings();

router.get("/get", (...args) => settingController.getSettings(...args));
router.post(
  "/save",
  body("mail_subject").isLength({ min: 2 }),
  body("sent_before").isNumeric(),
  body("virtual_userName").isLength({ min: 2 }),
  (...args) => settingController.saveSettings(...args)
);

export default router;
