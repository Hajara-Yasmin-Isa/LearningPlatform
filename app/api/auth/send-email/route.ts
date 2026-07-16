import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Verifies the Standard Webhooks signature Supabase includes on every hook call.
// Secret format: "v1,whsec_<base64>" — set in Supabase dashboard and SUPABASE_HOOK_SECRET env var.
function verifySignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.SUPABASE_HOOK_SECRET
  if (!secret) return false

  const [, whsec] = secret.split(',')
  if (!whsec?.startsWith('whsec_')) return false
  const key = Buffer.from(whsec.slice('whsec_'.length), 'base64')

  const msgId = request.headers.get('webhook-id')
  const msgTimestamp = request.headers.get('webhook-timestamp')
  const msgSignature = request.headers.get('webhook-signature')
  if (!msgId || !msgTimestamp || !msgSignature) return false

  const signed = `${msgId}.${msgTimestamp}.${rawBody}`
  const expected = crypto.createHmac('sha256', key).update(signed).digest('base64')

  return msgSignature.split(' ').some((s) => s.split(',')[1] === expected)
}

function confirmSignupHtml(confirmUrl: string, year: number): string {
  return `
<div style="background-color:#f9fafb;padding:40px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
    <div style="text-align:center;padding:40px 40px 10px 40px;">
      <a href="https://littafinfasaha.com" target="_blank">
        <img src="https://littafinfasaha.com/logo.png" alt="Littafin Fasaha Logo" width="120"
          style="border:none;outline:none;text-decoration:none;display:block;margin:0 auto 30px auto;" />
      </a>
      <h2 style="color:#1e293b;font-size:24px;font-weight:700;margin:0;">Tabbatar da Imel ɗinka</h2>
    </div>
    <div style="padding:24px 50px 40px 50px;text-align:center;color:#475569;line-height:1.6;">
      <p style="font-size:16px;margin-bottom:8px;">
        Maraba da shigowa cikin <strong>Littafin Fasaha</strong>!
      </p>
      <p style="font-size:16px;margin-bottom:32px;">
        Ka danna batun da ke ƙasa don tabbatar da adireshin imel ɗinka don fara koyon ilimin kwamfuta da Hausa.
      </p>
      <a href="${confirmUrl}" target="_blank"
        style="display:inline-block;background-color:#eab308;color:#1e293b;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;margin-bottom:32px;">
        Tabbatar da Imel →
      </a>
      <p style="font-size:13px;color:#94a3b8;margin-bottom:0;">
        Maɓallin yana aiki na awanni 24. Idan ba ku yi rajista ba, ku yi watsi da wannan saƙon.
      </p>
      <div style="border-top:1px solid #f1f5f9;padding-top:20px;text-align:left;margin-top:32px;">
        <p style="margin:0;font-size:14px;color:#64748b;">Mun gode,</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">Ƙungiyar Littafin Fasaha</p>
        <p style="margin:0;font-size:13px;color:#94a3b8;">Founder, Hajara-Yasmin Isa</p>
      </div>
    </div>
  </div>
  <div style="text-align:center;padding:24px 0 8px 0;">
    <p style="margin-bottom:15px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Ku biyo mu (Follow Us)</p>
    <a href="https://www.instagram.com/littafinfasaha/" target="_blank" style="text-decoration:none;margin:0 10px;">
      <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="24" height="24" style="display:inline-block;opacity:0.6;">
    </a>
    <a href="https://www.linkedin.com/company/littafin-fasaha/" target="_blank" style="text-decoration:none;margin:0 10px;">
      <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="24" height="24" style="display:inline-block;opacity:0.6;">
    </a>
  </div>
  <div style="text-align:center;margin-top:20px;border-top:1px solid #f1f5f9;padding-top:20px;">
    <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:0;">
      &copy; ${year} <strong>Littafin Fasaha</strong> — Dukkan haƙƙin mallaka an kiyaye su.
    </p>
    <p style="font-size:11px;color:#cbd5e1;margin-top:8px;">
      Kuna ganin wannan saƙon ne saboda kun yi rajista a
      <a href="https://littafinfasaha.com" style="color:#94a3b8;text-decoration:underline;">littafinfasaha.com</a>
    </p>
  </div>
</div>`
}

function passwordResetHtml(resetUrl: string, year: number): string {
  return `
<div style="background-color:#f9fafb;padding:40px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
    <div style="text-align:center;padding:40px 40px 10px 40px;">
      <a href="https://littafinfasaha.com" target="_blank">
        <img src="https://littafinfasaha.com/logo.png" alt="Littafin Fasaha Logo" width="120"
          style="border:none;outline:none;text-decoration:none;display:block;margin:0 auto 30px auto;" />
      </a>
      <h2 style="color:#1e293b;font-size:24px;font-weight:700;margin:0;">Sake saita kalmar sirri</h2>
    </div>
    <div style="padding:24px 50px 40px 50px;text-align:center;color:#475569;line-height:1.6;">
      <p style="font-size:16px;margin-bottom:32px;">
        Mun karɓi buƙatar sake saita kalmar sirri ta asusun ku. Danna maɓallin da ke ƙasa don ci gaba.
      </p>
      <a href="${resetUrl}" target="_blank"
        style="display:inline-block;background-color:#eab308;color:#1e293b;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;margin-bottom:32px;">
        Sake saita kalmar sirri →
      </a>
      <p style="font-size:13px;color:#94a3b8;margin-bottom:0;">
        Maɓallin yana aiki na minti 60. Idan ba ku nemi wannan ba, ku yi watsi da wannan saƙon.
      </p>
      <div style="border-top:1px solid #f1f5f9;padding-top:20px;text-align:left;margin-top:32px;">
        <p style="margin:0;font-size:14px;color:#64748b;">Mun gode,</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">Ƙungiyar Littafin Fasaha</p>
        <p style="margin:0;font-size:13px;color:#94a3b8;">Founder, Hajara-Yasmin Isa</p>
      </div>
    </div>
  </div>
  <div style="text-align:center;margin-top:20px;border-top:1px solid #f1f5f9;padding-top:20px;padding-bottom:20px;">
    <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:0;">
      &copy; ${year} <strong>Littafin Fasaha</strong> — Dukkan haƙƙin mallaka an kiyaye su.
    </p>
  </div>
</div>`
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  if (!verifySignature(request, rawBody)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const { user, email_data } = payload
  const { email_action_type, token_hash } = email_data

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://littafinfasaha.com'
  const year = new Date().getFullYear()

  try {
    if (email_action_type === 'signup') {
      const confirmUrl = `${siteUrl}/auth/confirm?token_hash=${token_hash}&type=email`
      await resend.emails.send({
        from: 'Littafin Fasaha <noreply@littafinfasaha.com>',
        to: user.email,
        subject: 'Tabbatar da imel ɗinka — Littafin Fasaha',
        html: confirmSignupHtml(confirmUrl, year),
      })
    } else if (email_action_type === 'recovery') {
      const resetUrl = `${siteUrl}/auth/confirm?token_hash=${token_hash}&type=recovery`
      await resend.emails.send({
        from: 'Littafin Fasaha <noreply@littafinfasaha.com>',
        to: user.email,
        subject: 'Sake saita kalmar sirri — Littafin Fasaha',
        html: passwordResetHtml(resetUrl, year),
      })
    }
  } catch (err) {
    console.error('[auth/send-email]', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({})
}
