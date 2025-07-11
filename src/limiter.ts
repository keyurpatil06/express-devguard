import { Request, Response, NextFunction } from "express";

type RateLimitOptions = {
  windowMs?: number; // time window (ms)
  max?: number; // max requests pre window
  message?: string; // response messsage
};

type IPStore = {
  [ip: string]: {
    count: number;
    firstRequestTime: number;
  };
};

const ipStore: IPStore = {};

export const rateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 20,
    message = "Too many requests, please try again later.",
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const record = ipStore[ip];

    if (!record) {
      ipStore[ip] = { count: 1, firstRequestTime: now };
      return next();
    }

    const timeElapsed = now - record.firstRequestTime;
    if (timeElapsed > windowMs) {
      ipStore[ip] = { count: 1, firstRequestTime: now };
      return next();
    }

    if (record.count >= max) {
      res.status(429).json({ error: message });
    } else {
      record.count++;
      next();
    }
  };
};
