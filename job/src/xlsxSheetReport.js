import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import CryptoJS from "crypto-js";
import fs from "fs";
import path from "path";
import "chromedriver";
import { xlsxReportLogger } from "./logger.js";

const xlsxSheetApp = {
  base: "https://xlsxSheet.msarslan.com/xlsxSheet",
  paths: {
    login: "/login.html#/",
    home: "/home#/",
    report: "/OpenAnalysis",
  },
};

export const xlsxSheetReport = async (env) => {
  let options = new chrome.Options();
  options.addArguments([
    `--disable-extensions`,
    `--disable-notifications`,
    `--disable-infobars`,
    `--incognito`,
  ]);
  options.setUserPreferences({
    "download.default_directory": env.basePath + env.jobPath + "\\tmp",
  });

  // Log - chrome webdriver
  xlsxReportLogger(env, `Starting chrome webdriver.`);

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    // Log - login
    xlsxReportLogger(env, `Logging into xlsxSheet.`);

    // xlsxSheet - IDP login.
    let IdpButton = By.className("tss-provider-link");
    await driver.get(xlsxSheetApp.base + xlsxSheetApp.paths.login);
    await driver.wait(until.elementLocated(IdpButton));
    IdpButton = driver.findElement(IdpButton);
    await driver.wait(until.elementIsEnabled(IdpButton, 15000));
    await IdpButton.click();

    // msarslan.com IDP - Redirect.
    let loginButton = By.id("loginButton2");
    const msarslan.comIDP = By.css('input[name="idp"][value="0"]');
    await driver.wait(until.elementLocated(loginButton));
    loginButton = driver.findElement(loginButton);
    await driver.findElement(msarslan.comIDP).click();
    loginButton.click();

    // msarslan.com IDP - Login.
    await driver.sleep(1 * 1000);
    await driver.navigate().refresh();
    const userPassword = CryptoJS.AES.decrypt(
      env.userPass,
      env.secretKey
    ).toString(CryptoJS.enc.Utf8);
    let loginSubmit = By.id("loginButton2");
    await driver.wait(until.elementLocated(loginSubmit));
    await driver.findElement(By.id("Ecom_User_ID")).sendKeys(env.userName);
    await driver.findElement(By.id("Ecom_Password")).sendKeys(userPassword);
    loginSubmit = driver.findElement(loginSubmit);
    loginSubmit.click();

    // xlsxSheet - Is Login Success?
    await driver.wait(
      until.elementLocated(By.id("library-navbar")),
      5 * 60  * 1000,
      "xlsxSheet login failed."
    );

    // Log - login success
    xlsxReportLogger(env, `Successfully logged into the xlsxSheet.`);

    // xlsxSheet - Wait until report ready. | Rep1
    xlsxReportLogger(env, `Navigating to report.`);
    await driver
      .navigate()
      .to(
        xlsxSheetApp.base +
          xlsxSheetApp.paths.report +
          `?file=${env.reportFileRep1}`
      );
    await driver.wait(
      until.elementLocated(By.css('[title="Pilotage"]')),
      12 * 60  * 1000,
      "Failed to load report. (Rep1)"
    );

    // Log - report open Rep1
    xlsxReportLogger(env, `Rep1 report opened successfully.`);

    // xlsxSheet - Open Pilotage en DFC. | Rep1
    const reportTitle = '[title="Pilotage en DFC"]';
    await driver.findElement(By.css(reportTitle)).click();
    await driver.sleep(2 * 1000);
    await driver.findElement(By.css(`.flex-item${reportTitle}`)).click();
    await driver.sleep(2 * 1000);

    // xlsxSheet - Export report. | Rep1
    const menuExportXPath = "//*[@title='Export']/parent::*";
    const menuDownloadXPath =
      "//*[@title='Table (without value formatting)']/parent::*";
    await driver.findElement(By.css('[title="File"]')).click();
    await driver.sleep(1 * 1000);
    await driver.findElement(By.xpath(menuExportXPath)).click();
    await driver.sleep(1 * 1000);
    await driver.findElement(By.xpath(menuDownloadXPath)).click();

    // Log - report downloaded Rep1
    xlsxReportLogger(env, `Rep1 report downloaded successfully.`);

    // xlsxSheet - Wait until report ready. | Rep2
    xlsxReportLogger(env, `Navigating to Rep2 report.`);
    await driver.sleep(8 * 1000);
    await driver
      .navigate()
      .to(
        xlsxSheetApp.base +
          xlsxSheetApp.paths.report +
          `?file=${env.reportFileRep2}`
      );
    await driver.wait(
      until.elementLocated(By.css('[title="Pilotage"]')),
      12 * 60  * 1000,
      "Failed to load report. (Rep2)"
    );

    // Log - report open Rep2
    xlsxReportLogger(env, `Rep2 report opened successfully.`);

    // xlsxSheet - Open Pilotage en DFC. | Rep2
    await driver.findElement(By.css(reportTitle)).click();
    await driver.sleep(2 * 1000);
    await driver.findElement(By.css(`.flex-item${reportTitle}`)).click();
    await driver.sleep(2 * 1000);

    // xlsxSheet - Export report. | Rep2
    await driver.findElement(By.css('[title="File"]')).click();
    await driver.sleep(1 * 1000);
    await driver.findElement(By.xpath(menuExportXPath)).click();
    await driver.sleep(1 * 1000);
    await driver.findElement(By.xpath(menuDownloadXPath)).click();

    // Chrome - Wait until download complete.
    await driver.wait(
      async () => {
        return await new Promise((resolve, reject) => {
          let csvFiles = [];
          const timer = setInterval(() => {
            fs.readdir(env.basePath + env.jobPath + "\\tmp", (err, files) => {
              csvFiles = files.filter((el) => path.extname(el) === ".csv");
            });
            if (csvFiles.length > 1) {
              resolve(true);
              clearInterval(timer);
            }
          }, 3000);
        });
      },
      10 * 60  * 1000,
      "Failed to download reports."
    );

    // Log - report downloaded Rep2
    xlsxReportLogger(env, `Rep2 report downloaded successfully.`);

    // xlsxSheet - Log out.
    const headerMenu = By.css('[ng-if="tssHeaderMenu.config.showUserName"]');
    await driver.navigate().to(xlsxSheetApp.base + xlsxSheetApp.paths.home);
    await driver.wait(until.elementLocated(headerMenu));
    await driver.findElement(headerMenu).click();
    await driver.wait(until.elementLocated(By.id("logOutItem")));
    await driver.findElement(By.id("logOutItem")).click();
    await driver.manage().deleteAllCookies();

    // Log - log out
    xlsxReportLogger(env, `Signed out of xlsxSheet app.`);
  } catch (err) {
    throw err;
  } finally {
    await driver.sleep(2 * 1000);
    await driver.quit();
  }
};
