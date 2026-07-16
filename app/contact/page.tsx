import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Contact</h1>
      <p className="text-slate-500 mb-10">
        We&apos;d love to hear from you during the beta.
      </p>

      <div className="glass rounded-2xl p-8 shadow-sm space-y-6 text-left">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Bug reports &amp; feedback
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">
            Use the <span className="font-semibold">Feedback</span> button in the bottom-right corner of any page — it goes straight to our team and includes the page you were on.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Email
          </p>
          <a
            href="mailto:contact@littafinfasaha.com"
            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors"
          >
            contact@littafinfasaha.com
          </a>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/help"
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Back to Help
        </Link>
      </div>
    </div>
  )
}
