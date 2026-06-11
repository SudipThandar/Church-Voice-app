import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

let adminClient: ReturnType<typeof createClient<Database>> | null = null

// Service-role client for admin API routes only. Bypasses RLS — never import from client components.
export function getSupabaseAdminClient() {
  if (!adminClient) {
    adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })
  }
  return adminClient
}
