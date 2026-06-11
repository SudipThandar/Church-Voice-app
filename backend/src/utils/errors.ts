import { Request, Response, NextFunction } from "express"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Unhandled error:", err)

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  })
}

export function notFoundHandler(
  _req: Request,
  res: Response
): void {
  res.status(404).json({ error: "Resource not found" })
}
