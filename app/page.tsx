import Link from 'next/link'
import ComingSoonOverlay from '@/components/features/waitlist/ComingSoonOverlay'

const features = [
  {
    icon: '🗣️',
    title: 'Harshen Uwa Kafin Komai',
    desc: 'Koyi dabarun kwamfuta dalla-dalla a harshen Hausa — babu shamakin fassara, fahimta ce kawai.',
  },
  {
    icon: '📖',
    title: 'Ajujuwan da Kwararru suka Tsara',
    desc: 'Abun ciki da ƙwararrun malamai suka rubuta, don kawo ilimin fasaha ga masu Harshen Hausa.',
  },
  {
    icon: '💻',
    title: 'Ƙwarewa ta Aiki',
    desc: 'Daga ka\'idojin koding zuwa dabarun kwamfuta — ƙwarewa ta gaske da zaka iya amfani da su nan take.',
  },
]

export default function Home() {
  return (
    <div className="space-y-20 pb-12">
      {process.env.NEXT_PUBLIC_COMING_SOON === 'true' && <ComingSoonOverlay />}

      {/* Hero */}
      <section className="text-center py-16 px-4">
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight max-w-3xl mx-auto">
          Koyon Fasaha da{' '}
          <span className="text-yellow-500">Harshen Hausa</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Littafin Fasaha yana kawo muku ilimin kwamfuta da fasaha a harshen Hausa — an rubuta shi a sauƙaƙe cikin yarenku, domin ci gabanku.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition-colors text-lg shadow-md"
          >
            Fara Koyo
          </Link>
          <Link
            href="/courses"
            className="px-8 py-3 glass hover:bg-white/80 text-slate-800 rounded-xl font-semibold transition-colors text-lg shadow-sm"
          >
            Duba Ajujuwa
          </Link>
        </div>
      </section>

      {/* Featured Course */}
      <section>
        <div className="text-center mb-8">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-1">
            Sabon fitowa
          </p>
          <h2 className="text-3xl font-bold text-slate-900">Littafinmu Na Farko</h2>
        </div>

        <div className="glass rounded-2xl shadow-lg overflow-hidden max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row">

            {/* Book cover */}
            <div className="sm:w-48 flex-shrink-0 overflow-hidden min-h-[240px] relative">
              <iframe
                src="/book1.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                className="absolute inset-0 w-full h-full border-0"
                title="Ka'idoji da Dabarun Koding a Kwamfuta"
              />
            </div>

            {/* Course info */}
            <div className="p-8 flex flex-col justify-center gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 leading-snug">
                  Ka&apos;idoji da Dabarun Koding a Kwamfuta
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Jagora mai cikakken bayani a Harshen Hausa game da ka&apos;idojin koding da dabarun kwamfuta, an rubuta shi don kawo ilimin fasaha kusa.
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Marubuciya <span className="font-semibold text-slate-700">Hajara-Yasmin Isa</span>
                </p>
                <Link
                  href="/courses"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
                >
                  Fara Koyo →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
          Me yasa Littafin Fasaha?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass rounded-xl p-7 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>


    </div>
  )
}
