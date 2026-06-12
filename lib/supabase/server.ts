//import {createClient} from '@supabase/supabase-js'

import { createServerClient as createSSRClient } from "@supabase/ssr"
import { cookies} from 'next/headers'


export async function createServerClient() {
    const cookieStore = await cookies()
    
    // this basicallly validate that environment variables are set
    // if (!supabaseUrl || !supabaseAnonKey) {
    //     throw new Error(
    //         'Missing Supabase environment variables. Check your .env.local file.'
    //     )
    // }



    return createSSRClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: {name: string; value: string; options?: any}[]) {
                    try {
                        cookiesToSet.forEach(({name, value, options }) =>
                            cookieStore.set(name, value, options))
                    } catch {

                    }
                }
            },
        }
    )
}