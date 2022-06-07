import { validationResult } from "express-validator";
import db from "../models/db.cjs";
import path from "path";
import env from "dotenv";
import fs from "fs";

env.config({
  path: path.resolve() + "\\..\\.env",
});

class Settings {
  async getSettings(req, res) {
    const settingsDb = await db.Setting.findAll({
      attributes: ["settingKey", "settingValue"],
    });

    const projectHeaders = await JSON.parse(
      fs.readFileSync(path.resolve() + "\\config\\projectHeaders.json")
    );

    return res.status(200).json({
      status: true,
      data: {
        virtualuserName process.env.userName,
        settings: settingsDb,
        headers: projectHeaders,
      },
    });
  }

  async saveSettings(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    } else {
      await this.updateOrCreate({
        setting_key: "mailSubject",
        setting_value: req.body.mail_subject,
      });

      await this.updateOrCreate({
        setting_key: "sentBefore",
        setting_value: req.body.sent_before,
      });

      await this.updateOrCreate({
        setting_key: "mailText",
        setting_value: req.body.email_content,
      });

      await this.updateOrCreate({
        setting_key: "projectLimit",
        setting_value: req.body.project_limit,
      });

      await this.updateOrCreate({
        setting_key: "appMode",
        setting_value: req.body.app_mode,
      });

      await this.updateOrCreate({
        setting_key: "mailErrorList",
        setting_value: JSON.stringify(
          req.body.email_error
            .split("\n")
            .filter((email) => email.toLowerCase().endsWith("msarslan.com"))
        ),
      });

      await this.updateOrCreate({
        setting_key: "projectHeaders",
        setting_value: JSON.stringify(
          Object.entries(req.body.headers)
            .filter((h) => h[1] == true)
            .map((h) => h[0])
        ),
      });

      this.changeEnv(
        `userName=${process.env.userName}`,
        `userName=${req.body.virtual_userName}`
      );

      return res.status(200).json({
        status: true,
        message: "Settings has been successfully saved.",
      });
    }
  }

  async updateOrCreate(data) {
    try {
      const findSetting = await db.Setting.findOne({
        where: {
          settingKey: data.setting_key,
        },
      });
      if (findSetting) {
        await db.Setting.update(
          {
            settingValue: data.setting_value,
          },
          {
            where: {
              settingKey: data.setting_key,
            },
          }
        );
      } else {
        await db.Setting.create({
          settingKey: data.setting_key,
          settingValue: data.setting_value,
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  changeEnv(oldLine, newLine) {
    try {
      const regex = new RegExp(oldLine, "g");
      fs.readFile(path.resolve() + "\\..\\.env", "utf8", function (err, data) {
        const formatted = data.replace(regex, newLine);
        fs.writeFile(
          path.resolve() + "\\..\\.env",
          formatted,
          "utf8",
          (err) => {
            if (err) return console.log(err);
          }
        );
      });
    } catch (error) {
      //
    }
  }
}

export default Settings;
