import { handleError } from "./handleErrors.js";
import { xlsxSheetReport } from "./xlsxSheetReport.js";
import { parseReport } from "./parseExcel.js";
import { sendReports } from "./sendReports.js";
import db from "../../api/models/db.cjs";
import CryptoJS from "crypto-js";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";

let jobCounter = 0;
export const xlsxReportJob = async (env, jobToken) => {
  try {
    // Create temp log file.
    fs.writeFileSync(
      `${process.env.basePath + process.env.jobPath}\\tmp\\log.txt`,
      `Process with ID ${jobToken} has been started.|${new Date().toUTCString()}`,
      (err) => {}
    );

    // Start job.
    jobCounter++;
    await db.JobHistory.create({
      jobToken: jobToken,
      jobStatus: "in_progress",
      jobProjects: {},
      jobMessage: null,
    });

    // Get report from xlsxSheet.
    await xlsxSheetReport(env);

    // Parse report.
    const sortedList = await parseReport(env);

    // Send reports.
    const sendMails = await sendReports(env, sortedList, jobToken);

    // Completed successfully.
    return sendMails;
  } catch (err) {
    await handleError(err, jobToken, env);
    if (jobCounter < 3)
      setTimeout(() => {
        xlsxReportJob(env, uuidv4());
      }, 3000);
  } finally {
    // Encrypt log file.
    const logs = fs.readFileSync(
      `${process.env.basePath + process.env.jobPath}\\tmp\\log.txt`,
      "utf8"
    );
    const encryptLogs = await CryptoJS.AES.encrypt(
      logs,
      process.env.secretKey
    ).toString();
    await fs.writeFileSync(
      `${process.env.basePath + process.env.jobPath}\\storage\\${jobToken}`,
      encryptLogs,
      (err) => {}
    );

    // Clear temporary files.
    await fs.emptyDirSync(`${process.env.basePath + process.env.jobPath}\\tmp`);
  }
};
