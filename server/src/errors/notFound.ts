import type { Request, Response, NextFunction } from "express";
import {AppError} from "./appError.js";

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(
    new AppError(
      `Route not found: ${req.originalUrl}`,
      404
    )
  );
};