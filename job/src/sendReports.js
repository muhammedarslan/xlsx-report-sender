import db from "../../api/models/db.cjs";
import Mailgen from "mailgen";
import { parse } from "node-html-parser";
import nodemailer from "nodemailer";
import imageToBase64 from "image-to-base64";
import { xlsxReportLogger } from "./logger.js";

constBy = (xs, f) => {
  return xs.reduce(
    (r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r),
    {}
  );
};

export const sendReports = async (env, list, jobToken) => {
  try {
    // Get settings.
    const settings = {};
    const settingsDb = await db.Setting.findAll();
    await settingsDb.map((v) => {
      settings[v.settingKey] =
        v.settingKey == "projectHeaders" || v.settingKey == "mailErrorList"
          ? JSON.parse(v.settingValue)
          : v.settingValue;
    });

    // Log - get user list.
    xlsxReportLogger(env, `Getting GF user list.`);

    // Get user list.
    const userList = await db.GfList.findAll({
      raw: true,
    });

    // Get sended projects.
    const sendedProjects = Object.entries(
      await db.SendedProject.findAll({
        raw: true,
      })
    ).map((p) => p[1].projectId);

    // list by gfType.
    constedList = awaitBy(userList, (c) => c.gfType);

    // Log - match users.
    xlsxReportLogger(env, `Users are matched for each GF type.`);

    // Match users for each gfType.
    const mailList = [];
    const reportsList = Object.entries(list);
    Object.keys(groupedList).forEach((g, i) => {
      mailList.push({
        gf: reportsList
          .filter((o) => o[1].GFS == g)
          .slice(0, settings["projectLimit"])
          .map((o) => o[1]),
        userList:edList[g],
      });
    });

    // Log - email template.
    xlsxReportLogger(env, `Creating email template.`);

    // Generate e-mail.
    const mailGenerator = new Mailgen({
      theme: "salted",
      product: {
        name: "XlsxReports Reports | msarslan.com",
        link: "#",
        copyright: `Copyright © ${new Date().getFullYear()} msarslan.com.`,
      },
    });

    // Log - smtp connection.
    xlsxReportLogger(env, `Establishing a connection to the mail server.`);

    // Smtp connection.
    let transporter = nodemailer.createTransport({
      pool: true,
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

    // Log - smtp connection success.
    xlsxReportLogger(env, `Successfully connected to the mail server.`);

    // Send reports by e-mail.
    let sendStatus = {
      success: 0,
      fail: 0,
    };
    const sendList = {
      firstTime: [],
      all: [],
    };
    const logoBase64 = await imageToBase64(
      env.basePath + env.jobPath + "\\img\\logo.png"
    );
    for await (const m of mailList) {
      const mailToList =
        settings["appMode"] == 1
          ? m.userList.map((u) => u.contactEmail)
          : m.userList
              .map((u) => u.contactEmail)
              .filter((mail) => settings["mailErrorList"].includes(mail));

      // Log - gf list.
      if (m.gf.length > 0) {
        xlsxReportLogger(
          env,
          `${mailToList.length} mail contacts found for ${m.gf[0].GFS}, e-mail is being prepared.`
        );
      }

      if (m.gf.length > 0 && mailToList.length > 0) {
        const mailData = [];

        await m.gf.forEach((p) => {
          const row = {};
          row["SB"] =
            settings["sentBefore"] == 2 &&
            sendedProjects.includes(p["N° Question"])
              ? true
              : false;
          settings["projectHeaders"].forEach((h) => {
            row[h] = p[h];
          });

          if (
            !sendedProjects.includes(p["N° Question"]) ||
            settings["sentBefore"] != 1
          ) {
            mailData.push(row);
          }

          if (!sendedProjects.includes(p["N° Question"])) {
            sendList.firstTime.push(p["N° Question"]);
          }
          sendList.all.push(p["N° Question"]);
        });

        const email = {
          body: {
            greeting: `<img width="200" height="200" style="width:100%;height:100%; max-width:200px;max-height:200px;" src="data:image/jpeg;base64,${logoBase64}"/>remv`,
            intro: [
              `<strong style="font-size:22px;" >Projects for ${m.gf[0].GFS},</strong>`,
              settings["mailText"],
            ],
            table: {
              data: mailData,
            },
            outro:
              settings["sentBefore"] == 0
                ? "* This mail may also contain some projects that have been sent before."
                : settings["sentBefore"] == 1
                ? "* Some projects that were previously sent from this mail may have been removed."
                : "* Projects sent before in this mail are marked in yellow.",
          },
        };
        const emailHtml = await mailGenerator.generate(email);
        const parseBody = parse(emailHtml);
        parseBody.querySelectorAll("table.data-table tr").forEach((el) => {
          const selectTd = el.querySelector("td");
          if (selectTd != null && selectTd.toString().includes("true")) {
            el.setAttribute(
              "style",
              `${el.getAttribute("style")}; background-color:#ffeb3b;`
            );
          }
          selectTd == null
            ? el.querySelector("th").remove()
            : selectTd.remove();
        });

        try {
          await transporter.sendMail({
            from: `XlsxReports Benchmark <xlsxreports@msarslan.com>`,
            to: mailToList,
            subject: settings["mailSubject"],
            html: parseBody.toString().replace("remv,", ""),
          });
          sendStatus.success++;
          // Log - send mail.
          xlsxReportLogger(
            env,
            `Email sent for ${m.gf[0].GFS}.`
          );
        } catch (error) {
          // Log - send mail - fail.
          xlsxReportLogger(
            env,
            `Failed to send email sent for ${
              m.gf[0].GFS
            }. Recipient list: ${mailToList.join(", ")}`
          );
          sendStatus.fail++;
        }
      }
    }

    if (sendStatus.fail > 0) {
      throw `${sendStatus.success} emails sent. An error occurred while sending ${sendStatus.fail} emails.`;
    } else {
      if (settings["appMode"] == 1) {
        for await (const pr of sendList.firstTime) {
          await db.SendedProject.create({
            projectId: pr,
          });
        }
      }

      await db.JobHistory.update(
        {
          jobStatus: "successful",
          jobProjects: sendList.all,
          jobMessage:
            (settings["appMode"] == 0 ? `Test Mode | ` : "") +
            `${sendStatus.success} email sent successfully.` +
            (sendStatus.fail > 0
              ? ` An error occurred while sending ${sendStatus.fail} emails.`
              : ""),
        },
        {
          where: {
            jobToken: jobToken,
          },
        }
      );

      xlsxReportLogger(
        env,
        `The XlsxReports process completed successfully. ${JSON.stringify(
          sendStatus
        )}`
      );
    }

    return sendStatus;
  } catch (error) {
    throw error;
  }
};
