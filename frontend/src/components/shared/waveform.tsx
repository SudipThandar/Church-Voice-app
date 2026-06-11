"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface WaveformProps {
  isActive: boolean
  isRecording?: boolean
  height?: number
  barCount?: number
}

function generateBars(count: number): number[] {
  return Array.from({ length: count }, () => 0.3 + Math.random() * 0.5)
}

export function Waveform({ isActive, isRecording = false, height = 60, barCount = 48 }: WaveformProps) {
  const [bars, setBars] = useState(() => generateBars(barCount))

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setBars(generateBars(barCount))
    }, 120)
    return () => clearInterval(interval)
  }, [isActive, barCount])

  return (
    <div className="flex items-center justify-center gap-[2px]" style={{ height }}>
      {bars.map((amplitude, i) => (
        <motion.div
          key={i}
          className={`w-[3px] rounded-full ${
            isRecording
              ? "bg-red-500"
              : isActive
                ? "bg-accent"
                : "bg-muted/40"
          }`}
          animate={{
            height: isActive ? `${amplitude * height * 0.8}px` : `${height * 0.2}px`,
            opacity: isActive ? 1 : 0.3,
          }}
          transition={{
            duration: 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
