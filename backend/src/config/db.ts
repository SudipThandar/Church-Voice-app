import mongoose from "mongoose"

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required")
  }

  try {
    await mongoose.connect(uri)
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err)
  })

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected")
  })
}
