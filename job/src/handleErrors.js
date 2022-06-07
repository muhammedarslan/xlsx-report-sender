import db from "./../../api/models/db.cjs";
import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { xlsxReportLogger } from "./logger.js";

export const handleError = async (errorMessage, jobToken, env) => {
  try {
    // Get settings
    const settings = {};
    const settingsDb = await db.Setting.findAll();
    await settingsDb.map((v) => {
      settings[v.settingKey] =
        v.settingKey == "projectHeaders" || v.settingKey == "mailErrorList"
          ? JSON.parse(v.settingValue)
          : v.settingValue;
    });

    // Log - error mail.
    xlsxReportLogger(env, `Error message is sent as an e-mail.`);

    // Update job message
    await db.JobHistory.update(
      {
        jobStatus: "failed",
        jobMessage:
          (settings["appMode"] == 0 ? `Test Mode | ` : "") +
          JSON.stringify(errorMessage).slice(0, 240),
      },
      {
        where: {
          jobToken: jobToken,
        },
      }
    );

    // Send error mail
    const mailGenerator = new Mailgen({
      theme: "salted",
      product: {
        name: "XlsxReports Reports | msarslan.com",
        link: "#",
        copyright: `Copyright © ${new Date().getFullYear()} msarslan.com.`,
      },
    });

    // Smtp connection.
    let transporter = nodemailer.createTransport({
      pool: false,
      host: process.env.smtpHost,
      port: process.env.smtpPort,
      secure: false,
      auth: {
        user: process.env.smtpUser,
        pass: process.env.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    await transporter.verify();

    const email = {
      body: {
        greeting: `remv`,
        intro: [
          `Some errors occurred in the XlsxReports bot process and the operation could not be completed.`,
          (settings["appMode"] == 0 ? `Test Mode | ` : "") +
            JSON.stringify(errorMessage),
        ],
        outro: `You can view the process details via the XlsxReports interface and restart the process manually.`,
      },
    };
    const emailHtml = await mailGenerator.generate(email);
    await transporter.sendMail({
      from: `XlsxReports Benchmark <xlsxreports@msarslan.com>`,
      to: settings["mailErrorList"],
      subject: `Error Occurred in XlsxReports Process`,
      html: emailHtml.replace("remv,", ""),
    });

    return;
  } catch (error) {
    //
  }
};
