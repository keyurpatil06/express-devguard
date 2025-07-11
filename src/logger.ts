import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

type LoggerOptions = {
  redact?: string[];
  logToFile?: boolean;
  logFilePath?: string;
};

export const apiLogger = (options: LoggerOptions = {}) => {
  const {
    redact = [],
    logToFile = false,
    logFilePath = "requests.log",
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const originalSend = res.send;

    res.send = function (body: any): Response {
      const duration = Date.now() - start;
      const log = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        body: redactFields(req.body, redact),
        timeStamp: new Date().toISOString(),
      };

      const msg = `[${log.method}] ${log.url} - ${log.status} - ${log.duration}`;
      console.log(colorLog(log.status, msg));

      if (logToFile) {
        const fullPath = path.join(process.cwd(), logFilePath);
        fs.appendFileSync(fullPath, JSON.stringify(log) + "\n");
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

const redactFields = (body: any, keys: string[]) => {
  if (!body || typeof body !== "object") {
    return body;
  }

  const redacted = { ...body };

  for (const key of keys) {
    if (key in redacted) {
      redacted[key] = "***";
    }
  }

  return redacted;
};

const colorLog = (status: number, msg: string) => {
  const green = "\x1b[32m"; // for success (2xx)
  const yellow = "\x1b[33m"; // for client errors (4xx)
  const red = "\x1b[31m"; // for server errors (5xx)
  const reset = "\x1b[0m"; // reset color after message

  if (status >= 500) {
    return red + msg + reset;
  }
  if (status >= 400) {
    return yellow + msg + reset;
  }

  return green + msg + reset;
};
