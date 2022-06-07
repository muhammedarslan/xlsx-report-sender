import db from "../models/db.cjs";
import { xlsxReportJob } from "./../../job/src/xlsxReportJob.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import env from "dotenv";
import CryptoJS from "crypto-js";
import fs from "fs";

env.config({
  path: path.resolve() + "\\..\\.env",
});

class Job {
  startJobManually(req, res) {
    xlsxReportJob(process.env, uuidv4());
    return res.status(200).json({
      status: true,
    });
  }

  async getJobList(req, res) {
    const jobList = await db.JobHistory.findAll({
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    const logs = fs.readdirSync(
      `${process.env.basePath + process.env.jobPath}\\storage`
    );

    const jobs = [];
    Object.entries(jobList).forEach((j) => {
      jobs.push({
        createdAt: j[1].createdAt,
        updatedAt: j[1].updatedAt,
        jobMessage: j[1].jobMessage == null ? "-" : j[1].jobMessage,
        jobToken: j[1].jobToken,
        jobStatus: j[1].jobStatus,
        jobHasLog: logs.includes(j[1].jobToken),
        jobBadge:
          j[1].jobStatus == "successful"
            ? "success"
            : j[1].jobStatus == "failed"
            ? "danger"
            : "info",
      });
    });

    return res.status(200).json({
      status: true,
      data: jobs,
    });
  }

  async jobDetail(req, res) {
    const logId = req.params.token;
    if (this.#isValidUUID(logId)) {
      const logFile = `${
        process.env.basePath + process.env.jobPath
      }\\storage\\${logId}`;
      try {
        if (fs.existsSync(logFile)) {
          const logsDecrypyed = await CryptoJS.AES.decrypt(
            fs.readFileSync(logFile, "utf8"),
            process.env.secretKey
          ).toString(CryptoJS.enc.Utf8);

          return res.status(200).json({
            status: true,
            data: logsDecrypyed.split("\n").map((l, i) => {
              const parseLine = l.split("|");
              return {
                message: `#${i + 1} - ${parseLine[0]}`,
                date: parseLine[1],
              };
            }),
          });
        } else {
          return res.status(401).json({
            status: false,
          });
        }
      } catch (error) {
        return res.status(401).json({
          status: false,
        });
      }
    } else {
      return res.status(401).json({
        status: false,
      });
    }
  }

  #isValidUUID(uuid) {
    // Regular expression to check if string is a valid UUID
    const regexExp =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    return regexExp.test(uuid);
  }
}

export default Job;
