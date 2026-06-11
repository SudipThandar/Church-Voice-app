import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { env } from "./config/env"
import { connectDatabase } from "./config/db"
import { errorHandler, notFoundHandler } from "./utils/errors"
import authRoutes from "./routes/auth"
import bookRoutes from "./routes/books"
import chapterRoutes from "./routes/chapters"
import recordingRoutes from "./routes/recordings"
import analyticsRoutes from "./routes/analytics"

const app = express()

app.use(helmet())
app.use(cors({ origin: env.corsOrigin, credentials: true }))
app.use(express.json({ limit: "10mb" }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use("/api/", limiter)

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)
app.use("/api/books", chapterRoutes)
app.use("/api/recordings", recordingRoutes)
app.use("/api/analytics", analyticsRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

async function start() {
  await connectDatabase()

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`)
  })
}

start().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})

export default app
