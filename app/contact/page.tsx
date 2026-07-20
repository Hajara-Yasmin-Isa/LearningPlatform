import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Tuntuɓe mu</h1>
      <p className="text-slate-500 mb-10">
        Muna farin cikin jin daga gare ku a lokacin beta.
      </p>

      <div className="glass rounded-2xl p-8 shadow-sm space-y-6 text-left">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Rahoton kurakurai da ra&apos;ayi
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">
            Yi amfani da baton ɗin &apos;Feedback&apos; da ke ƙasan hannun dama na kowane shafi — yana zuwa kai tsaye ga ɓangaren ƙungiyarmu da ke kula da tambayoyi.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Imel
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
          ← Komawa Taimako
        </Link>
      </div>
    </div>
  )
}
