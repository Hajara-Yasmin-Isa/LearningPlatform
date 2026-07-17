import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
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
    from: 'Littafin Fasaha <hello@littafinfasaha.com>', // Use hello@ instead of noreply for a friendlier feel
    to: email,
    subject: 'Barka da shigowa! 🚀 — Littafin Fasaha',
    html: `
      <div style="background-color: #f9fafb; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          

          
          <div style="text-align: center; padding: 40px 40px 10px 40px;">
            <a href="https://littafinfasaha.com" target="_blank">
              <img 
                src="https://littafinfasaha.com/logo.png" 
                alt="Littafin Fasaha Logo" 
                width="120" 
                style="border: none; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; display: block; margin: 0 auto 30px auto;"
              />
            </a>
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 700; margin: 0;">Maraba da shigowa!</h2>
          </div>

          <div style="padding: 0 50px 40px 50px; text-align: center; color: #475569; line-height: 1.6;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Sannu da shigowa cikin jerin waɗanda za su fara samun labarin <strong>Littafin Fasaha</strong>.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 24px;">
              Burinmu shi ne kawo sauƙi a duk abin da ya shafi kwamfuta a harshen Hausa. 
              Za mu sanar da ku da zarar mun buɗe ƙofofinmu don fara karatu.
            </p>

            <p style="font-size: 16px; font-weight: 600; color: #3b82f6; margin-bottom: 40px;">
              Muna godiya da goyon bayanku!
            </p>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: left;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">Mun gode,</p>
              <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1e293b;">Ƙungiyar Littafin Fasaha</p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Founder, Hajara-Yasmin Isa</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding-bottom: 30px;">
          <p style="margin-bottom: 15px; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Ku biyo mu (Follow Us)</p>
  
            <a href="https://www.instagram.com/littafinfasaha/" target="_blank" style="text-decoration: none; margin: 0 10px;">
              <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="24" height="24" style="display: inline-block; opacity: 0.6;">
            </a>

          <a href="https://www.linkedin.com/company/littafin-fasaha/" target="_blank" style="text-decoration: none; margin: 0 10px;">
            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="24" height="24" style="display: inline-block; opacity: 0.6;">
          </a>
        </div>

        <div style="text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
            &copy; ${new Date().getFullYear()} <strong>Littafin Fasaha</strong> — Dukkan haƙƙin mallaka an kiyaye su.
         </p>
          <p style="font-size: 11px; color: #cbd5e1; margin-top: 8px;">
            Kuna ganin wannan saƙon ne saboda kun yi rajista a <a href="https://littafinfasaha.com" style="color: #94a3b8; text-decoration: underline;">littafinfasaha.com</a>
          </p>
        </div>
    `,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
