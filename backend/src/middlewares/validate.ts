import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Request validation failed",
          error: {
            code: "VALIDATION_ERROR",
            fields: error.errors.reduce((acc: Record<string, string>, err) => {
              const field = err.path.join(".");
              acc[field] = err.message;
              return acc;
            }, {}),
          },
        });
        return;
      }
      next(error);
    }
  };
};
