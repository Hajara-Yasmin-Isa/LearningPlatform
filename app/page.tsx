import Link from 'next/link'

const features = [
  {
    icon: '🗣️',
    title: 'Native Language First',
    desc: 'Learn computing concepts explained clearly in Hausa — no translation barriers, just understanding.',
  },
  {
    icon: '📖',
    title: 'Expert-Written Courses',
    desc: 'Content crafted by CS experts, built to bring technical education to Hausa speakers.',
  },
  {
    icon: '💻',
    title: 'Practical Skills',
    desc: 'From coding rules to computer strategies — real skills you can apply immediately.',
  },
]

export default function Home() {
  return (
    <div className="space-y-20 pb-12">

      {/* Hero */}
      <section className="text-center py-16 px-4">
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight max-w-3xl mx-auto">
          Koyon Fasaha ta{' '}
          <span className="text-yellow-500">Harshen Hausa</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Littafin Fasaha brings computing and technology education to Hausa speakers —
          written clearly in your language, for your future.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition-colors text-lg shadow-md"
          >
            Fara Koyo — Start Learning
          </Link>
          <Link
            href="/lessons"
            className="px-8 py-3 glass hover:bg-white/80 text-slate-800 rounded-xl font-semibold transition-colors text-lg shadow-sm"
          >
            Browse Courses
          </Link>
        </div>
      </section>

      {/* Featured Course */}
      <section>
        <div className="text-center mb-8">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-1">
            Now Available
          </p>
          <h2 className="text-3xl font-bold text-slate-900">Our First Course</h2>
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
                <p className="text-slate-500 text-sm mt-1 italic">
                  Rules and Strategies of Coding in Computing
                </p>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                A comprehensive Hausa-language guide to coding principles and computer strategies,
                written to make technical knowledge accessible to every Hausa speaker.
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  By <span className="font-semibold text-slate-700">Hajara-Yasmin Isa</span>
                </p>
                <Link
                  href="/lessons"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
                >
                  Explore Course →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
          Why Littafin Fasaha?
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

      {/* CTA Banner */}
      <section className="glass rounded-2xl p-12 text-center shadow-lg border border-yellow-200/60">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Ready to start your journey?
        </h2>
        <p className="text-slate-600 mb-8 text-lg max-w-xl mx-auto">
          Join learners discovering computing in Hausa for the first time.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition-colors text-lg shadow-md"
          >
            Create Free Account
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 glass hover:bg-white/80 text-slate-700 rounded-xl font-semibold transition-colors text-lg shadow-sm border border-slate-200/60"
          >
            Log In
          </Link>
        </div>
      </section>

    </div>
  )
}
