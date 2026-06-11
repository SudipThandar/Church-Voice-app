import { Router, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { User } from "../models/User"
import { env } from "../config/env"
import { validate } from "../middleware/validate"
import { authenticate, AuthRequest } from "../middleware/auth"

const router = Router()

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
  }),
})

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  }),
})

function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as any,
  })
}

router.post("/register", validate(registerSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      res.status(409).json({ error: "Email already registered" })
      return
    }

    const user = await User.create({ email, password, name })
    const token = generateToken(String(user._id), user.role)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

router.post("/login", validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" })
      return
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" })
      return
    }

    const token = generateToken(String(user._id), user.role)

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    user: {
      id: req.user!._id,
      email: req.user!.email,
      name: req.user!.name,
      role: req.user!.role,
    },
  })
})

export default router
