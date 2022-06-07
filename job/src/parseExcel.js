import XLSX from "xlsx";
import fs from "fs";
import path, { parse } from "path";
import { xlsxReportLogger } from "./logger.js";

const removedProjects = [];
const removedETA = [0, 9];

const orderTmpFiles = (dir) => {
  return fs
    .readdirSync(dir)
    .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
    .filter((el) => path.extname(el) === ".csv")
    .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};

const findReportFile = (dir) => {
  const files = orderTmpFiles(dir);
  return files.length ? files : [undefined, undefined];
};

const customOrderDate = (a, b) => {
  return new Date(b.createdUnix).getTime() - new Date(a.createdUnix).getTime();
};

export const parseReport = async (env) => {
  const tmpPath = env.basePath + env.jobPath + "\\tmp";
  // Log - parse report
  xlsxReportLogger(env, `Processing Excel files...`);

  const excelFileRep1 = findReportFile(tmpPath)[0];
  if (excelFileRep1 == undefined) throw "Report file not found. (Rep1)";

  const excelFileRep2 = findReportFile(tmpPath)[1];
  if (excelFileRep2 == undefined) throw "Report file not found. (Rep2)";

  // Parse Excel file (Rep1).
  const workbookRep1 = XLSX.readFile(`${tmpPath}\\${excelFileRep1.file}`, {
    raw: true,
  });
  const sheetRep1 = workbookRep1.Sheets[workbookRep1.SheetNames[0]];
  const parsedDataRep1 = XLSX.utils.sheet_to_json(sheetRep1);

  // Parse Excel file (Rep2).
  const workbookRep2 = XLSX.readFile(`${tmpPath}\\${excelFileRep2.file}`, {
    raw: true,
  });
  const sheetRep2 = workbookRep2.Sheets[workbookRep2.SheetNames[0]];
  const parsedDataRep2 = XLSX.utils.sheet_to_json(sheetRep2);

  // Combine reports.
  let parsedData = [...parsedDataRep1, ...parsedDataRep2];
  const tableHeaders = Object.keys(parsedData[0]);

  // Update table headers.
  try {
    fs.writeFileSync(
      env.basePath + env.apiPath + "\\config\\projectHeaders.json",
      JSON.stringify(tableHeaders)
    );
  } catch (error) {
    throw error;
  }

  // Convert date string to date object.
  parsedData.forEach((obj, index) => {
    obj.dateSplit = obj["Date Création"].split(".");
    obj.createdUnix = new Date(
      `${obj.dateSplit[2]}-${obj.dateSplit[1]}-${obj.dateSplit[0]}`
    ).getTime();
  });

  // Remove projects.
  parsedData = parsedData.filter(
    (obj) => !removedProjects.includes(obj.Projet)
  );

  // Log - remove projects.
  xlsxReportLogger(
    env,
    `${removedProjects.join(", ")} projects are being removed.`
  );

  // Remove etats.
  parsedData = parsedData.filter(
    (obj) => !removedETA.includes(parseInt(obj.État))
  );

  // Log - remove etats.
  xlsxReportLogger(env, `${removedETA.join(", ")} etats are being removed.`);

  // Sort list by creation date && return.
  return parsedData.sort(customOrderDate);
};
