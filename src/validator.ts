import { Request, Response, NextFunction } from "express";

type Rule = {
  required?: boolean;
  type: "string" | "number" | "boolean";
  minLength?: number;
  maxLength?: number;
};

type validationSchema = {
  [field: string]: Rule;
};

export const validateSchema = (schema: validationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const field in schema) {
      const rules = schema[field];
      const value = req.body[field];

      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }

      if (rules.minLength) {
        if (
          (typeof value === "string" && value.length < rules.minLength) ||
          (typeof value === "number" && value < rules.minLength)
        ) {
          errors.push(
            `${field} must be at least ${rules.minLength} ${typeof value === "string" ? "characters" : "units"}`
          );
        }
      }

      if (rules.maxLength) {
        if (
          (typeof value === "string" && value.length > rules.maxLength) ||
          (typeof value === "number" && value > rules.maxLength)
        ) {
          errors.push(
            `${field} must be at most ${rules.maxLength} ${typeof value === "string" ? "characters" : "units"}`
          );
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    next();
  };
};
