import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)

// Values are interpolated into email HTML — escape them so a crafted
// name/title can't inject markup into the message body.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function enrollmentHtml(studentName: string, courseTitle: string, dashboardUrl: string, year: number): string {
  const greeting = studentName ? `Barka da zuwa, ${escapeHtml(studentName)}!` : 'Barka da zuwa!'
  return `
<div style="background-color:#f9fafb;padding:40px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
    <div style="text-align:center;padding:40px 40px 10px 40px;">
      <a href="https://littafinfasaha.com" target="_blank">
        <img src="https://littafinfasaha.com/logo.png" alt="Littafin Fasaha Logo" width="120"
          style="border:none;outline:none;text-decoration:none;display:block;margin:0 auto 30px auto;" />
      </a>
      <h2 style="color:#1e293b;font-size:24px;font-weight:700;margin:0;">An tabbatar da rajistarka!</h2>
    </div>
    <div style="padding:24px 50px 40px 50px;text-align:center;color:#475569;line-height:1.6;">
      <p style="font-size:16px;margin-bottom:8px;">
        ${greeting}
      </p>
      <p style="font-size:16px;margin-bottom:32px;">
        An yi rajistarka a kwas ɗin <strong>${escapeHtml(courseTitle)}</strong>.
        Za ka iya fara karatu yanzu — danna maballin da ke ƙasa don zuwa dashboard ɗinka.
      </p>
      <a href="${dashboardUrl}" target="_blank"
        style="display:inline-block;background-color:#eab308;color:#1e293b;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;margin-bottom:32px;">
        Je zuwa Dashboard →
      </a>
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
    <p style="font-size:11px;color:#cbd5e1;margin-top:8px;">
      Kuna ganin wannan saƙon ne saboda kun yi rajista a
      <a href="https://littafinfasaha.com" style="color:#94a3b8;text-decoration:underline;">littafinfasaha.com</a>
    </p>
  </div>
</div>`
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(`enrollment-email:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const { studentEmail, studentName, courseTitle } = await request.json()

  if (!studentEmail || !courseTitle) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://littafinfasaha.com'
  const dashboardUrl = `${siteUrl}/dashboard`
  const year = new Date().getFullYear()

  try {
    await resend.emails.send({
      from: 'Littafin Fasaha <noreply@littafinfasaha.com>',
      to: studentEmail,
      subject: `An yi rajistarka a ${courseTitle}`,
      html: enrollmentHtml(studentName ?? '', courseTitle, dashboardUrl, year),
    })
  } catch (err) {
    console.error('[email/enrollment]', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
