import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/supabase/auth'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required'
        },
        { status: 400 }
      )
    }

    // Attempt login
    const result = await loginUser(email, password)

    // Return appropriate status code
    const statusCode = result.success? 200 : 401

    return NextResponse.json(result, { status: statusCode })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}