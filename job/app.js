import path from "path";
import env from "dotenv";
import { xlsxReportJob } from "./src/xlsxReportJob.js";
import { v4 as uuidv4 } from "uuid";

env.config({
  path: path.resolve() + "\\..\\.env",
});

(async () => {
  // Start job
  return await xlsxReportJob(process.env, uuidv4());
})();
