import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.from('waitlist').insert({ email })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: "Kana cikin jeri tuni!" }, { status: 409 })
    }
    return NextResponse.json({ error: 'Wani abu ya faru. Don Allah sake gwadawa.' }, { status: 500 })
  }

  // Send confirmation email
  await resend.emails.send({
    from: 'Littafin Fasaha <noreply@littafinfasaha.com>',
    to: email,
    subject: 'Barka da shigowa! Mun karɓi saƙonka — Littafin Fasaha',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background-color: #ffffff; border: 1px solid #f1f5f9;">
        <h1 style="font-size: 24px; color: #0f172a; margin-bottom: 16px;">Maraba da shigowa! 🚀</h1>

        <p style="font-size: 16px; line-height: 1.8; color: #334155;">
          Sannu da shigowa cikin jerin waɗanda za su fara samun labarin <strong>Littafin Fasaha</strong>.
        </p>

        <p style="font-size: 16px; line-height: 1.8; color: #334155;">
          Burinmu shi ne kawo sauyi a yadda ake koyon dabarun kwamfuta da koding a harshen Hausa.
        </p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; font-size: 14px; color: #475569;">
            <strong>Abin da ke tafe:</strong> Za mu sanar da kai da zarar mun buɗe kofofinmu don fara karatu. Ka kasance cikin shiri!
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.8; color: #334155;">
          Mungode da goyon bayanka wajen gina wannan tarihi.<br />
          <strong>Hajara-Yasmin Isa</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          &copy; ${new Date().getFullYear()} Littafin Fasaha. An kiyaye dukkan haƙƙin mallaka.
        </p>
      </div>
    `,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
