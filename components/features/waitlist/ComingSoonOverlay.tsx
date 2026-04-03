'use client'

import Image from 'next/image'
import WaitlistForm from './WaitlistForm'

export default function ComingSoonOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(240, 249, 255, 0.55)' }}
    >
      <div className="glass-strong rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center space-y-6 border border-white/80">

        {/* Animated emoji */}
        <div className="flex justify-center items-center gap-3">
          <span className="text-5xl animate-bounce" style={{ animationDelay: '0ms' }}>🛠️</span>
          <span className="text-5xl animate-bounce" style={{ animationDelay: '150ms' }}>⚙️</span>
          <span className="text-5xl animate-bounce" style={{ animationDelay: '300ms' }}>🖥️</span>
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Wani abu mai girma yana zuwa
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Littafin Fasaha na nan tafe. Muna gina sabon dandalin koyon dabarun
            kwamfuta a harshen Hausa. Shigar da imel ɗinka domin ka kasance
            cikin waɗanda za su fara sani.
          </p>
        </div>

        {/* Waitlist form */}
        <WaitlistForm />

        {/* Subtext */}
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/logo.png"
            alt="Littafin Fasaha logo"
            width={36}
            height={36}
            className="rounded-full shadow-sm"
          />
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Littafin Fasaha &mdash; Dukkan haƙƙin mallaka an kiyaye su.
          </p>
        </div>

      </div>
    </div>
  )
}
