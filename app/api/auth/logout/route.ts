import { NextRequest, NextResponse } from 'next/server'
import { logoutUser } from '@/lib/supabase/auth'


export async function POST(request: NextRequest) {
  try {
    // Attempt logout
    const result = await logoutUser()

    // Return appropriate status code
    const statusCode = result.success ? 200 : 500

    return NextResponse.json(result, { status: statusCode })
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}