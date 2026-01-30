import { createClient } from '@supabase/supabase-js'

// These environment variables must be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env.local file.'
  )
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)