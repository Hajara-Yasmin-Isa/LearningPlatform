import Link from 'next/link'
import Image from 'next/image'
import AuthForm from '@/components/features/auth/AuthForm'

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        {/* Brand mark */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Littafin Fasaha logo"
            width={56}
            height={56}
            className="rounded-full mx-auto mb-4 shadow-md"
          />
          <h1 className="text-2xl font-bold text-slate-900">Yi rajista</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Fara koyon kwamfuta a Harshen Hausa yau — kyauta ne
          </p>
        </div>

        <AuthForm submitLabel="Yi rajista" mode="signup" />

        <p className="text-center text-sm text-slate-500 mt-6">
          Ka riga ka yi rajista?{' '}
          <Link href="/auth/login" className="text-yellow-600 font-semibold hover:text-yellow-700">
            Shiga
          </Link>
        </p>

      </div>
    </div>
  )
}
