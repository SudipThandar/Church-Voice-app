import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env"
import { User, IUser } from "../models/User"

export interface AuthRequest extends Request {
  user?: IUser
}

interface JwtPayload {
  userId: string
  role: string
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authentication required" })
      return
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload

    const user = await User.findById(decoded.userId)
    if (!user) {
      res.status(401).json({ error: "User not found" })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" })
      return
    }
    next()
  }
}
