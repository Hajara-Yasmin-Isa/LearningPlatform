import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Game da Mu</h1>
      <p className="text-slate-500 mb-10">
        Littafin Fasaha dandali ne na koyon ilimin fasaha da dabarun kwamfuta, wanda Hajara-Yasmin Isa, masaniya kuma mai bincike a fannin kimiyyar kwamfuta (Computer Science Researcher) ta samar da shi.
      </p>

      <div className="glass rounded-2xl p-8 shadow-sm space-y-6 text-left">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Manufarmu
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">
            Babban burin Littafin Fasaha shi ne buɗe wa kowa ƙofa domin koyon ilimin zamani kai-tsaye ta Harshen Hausa. Muna so mu kawar da shamakin yare, domin mu tabbatar da cewa tazarar yare ba ta zama tazarar fahimta ba.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Matakinmu na Yanzu
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">
            A halin yanzu, dandalinmu yana matakin gwaji (Beta). Muna ci gaba da ƙirƙirar sabbin darussa da fasaloli domin inganta muku karatu. Ra&apos;ayoyinku da shawarwarinku sune za su taimaka mana wajen gina makomar Littafin Fasaha.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Komawa Gida
        </Link>
      </div>
    </div>
  )
}
