import express from "express";
import Job from "../controllers/jobController.js";

const router = express.Router();
const jobController = new Job();

router.get("/get", (...args) => jobController.getJobList(...args));
router.get("/detail/:token", (...args) => jobController.jobDetail(...args));
router.post("/start", (...args) => jobController.startJobManually(...args));

export default router;
