import { createServerClient } from '@/lib/supabase/server'
import { getCourseById, isCourseComplete } from '@/lib/supabase/courses'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CourseCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const course = await getCourseById(id)
  if (!course) notFound()

  const complete = await isCourseComplete(user.id, id, supabase)
  if (!complete) redirect(`/courses/${id}`)

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-lg mx-auto">
        <p className="text-7xl mb-6">🎉</p>

        <h1 className="text-4xl font-bold text-slate-900 mb-1">Kammala!</h1>
        <p className="text-lg text-slate-500 mb-8">
          You finished every lesson in this course.
        </p>

        <div className="glass rounded-2xl p-8 mb-10 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Course completed
          </p>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h2>
          {course.description && (
            <p className="text-slate-500 text-sm leading-relaxed">{course.description}</p>
          )}
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/courses"
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            Browse More Courses
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-sm transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
