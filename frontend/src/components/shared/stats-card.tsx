"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  color?: string
  delay?: number
}

export function StatsCard({ icon: Icon, label, value, trend, trendUp = true, color = "primary", delay = 0 }: StatsCardProps) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    red: "bg-red-500/10 text-red-650 border-red-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  }

  const borderColors: Record<string, string> = {
    primary: "group-hover:border-primary/30",
    accent: "group-hover:border-accent/40",
    green: "group-hover:border-emerald-500/30",
    red: "group-hover:border-red-500/30",
    purple: "group-hover:border-purple-500/30",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={`group rounded-2xl border border-border/50 bg-white p-6 shadow-premium transition-all duration-300 ${borderColors[color] || "group-hover:border-primary/25"}`}
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-3 border ${colorMap[color] || colorMap.primary} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            trendUp 
              ? "bg-emerald-500/10 text-emerald-600" 
              : "bg-red-500/10 text-red-600"
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-5">
        <p className="text-xs font-bold text-muted uppercase tracking-widest leading-none">{label}</p>
        <p className="text-3xl font-extrabold text-dark tracking-tight mt-2.5 leading-none font-sans">{value}</p>
      </div>
    </motion.div>
  )
}
