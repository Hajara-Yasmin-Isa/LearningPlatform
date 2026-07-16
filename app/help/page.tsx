import Link from 'next/link'

const faqs = [
  {
    q: 'Ta yaya zan yi rajista a aji?',
    a: 'Je shafin Ajujuwa, danna ajin da kake so, sannan danna "Yi rajista" a shafin bayani.',
  },
  {
    q: 'Ta yaya ake adana ci gabana?',
    a: 'Ana adana ci gabanka kai tsaye yayin da ka kammala kowane darasi. Da zarar ka dawo, zai ci gaba daga inda ka tsaya.',
  },
  {
    q: 'Wadanne irin ayyukan gwajin ne ake da su?',
    a: 'Darussan sun haɗa da tambayoyin zaɓe, gajerun tambayoyi, da kuma atisayen furogiramin inda zaka rubuta kuma ka gwada gudanar da furogiram.',
  },
  {
    q: 'Ta yaya zan tura beta feedback?',
    a: "Danna baton ɗin 'Feedback' da ke ƙasan hannun dama na kowane shafi. Kana iya bayar da rahoton matsaloli or ba da shawarwari.",
  },
  {
    q: 'Na sami kura. Me zan yi?',
    a: 'Yi amfani da maɓallin Feedback kuma zaɓi "Bug". Bayyana abin da ya faru da shafin da kake ciki — wannan yana taimakonmu wajen gyara shi da sauri.',
  },
]

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Taimako</h1>
      <p className="text-slate-500 mb-10">
        Amsoshin tambayoyi da aka fi yi game da Littafin Fasaha.
      </p>

      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.q} className="glass rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-2">{faq.q}</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-slate-500 text-sm mb-4">Har yanzu kana da tambaya?</p>
        <Link
          href="/contact"
          className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          Tuntuɓe mu
        </Link>
      </div>
    </div>
  )
}
