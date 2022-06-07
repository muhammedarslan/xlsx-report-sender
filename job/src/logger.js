import fs from "fs";

export const xlsxReportLogger = async (env, logMessage) => {
  const logFile = env.basePath + env.jobPath + "\\tmp\\log.txt";
  fs.appendFileSync(logFile, `\n${logMessage}|${new Date().toUTCString()}`);
};
