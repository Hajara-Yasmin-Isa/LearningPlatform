import { notFound } from 'next/navigation'
import LessonSections from '@/components/features/lessons/LessonSections'
import { createServerClient } from '@/lib/supabase/server'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createServerClient()
    const { data } = await supabase.from('lessons').select('title').eq('id', id).single()
    return { title: data?.title ?? 'Lesson' }
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const supabase = await createServerClient()

    const { data: lesson } = await supabase
        .from('lessons')
        .select('*, sections(*, exercises(*))')
        .eq('id', id)
        .order('section_order', { referencedTable: 'sections', ascending: true })
        .single()

    if (!lesson) notFound()

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>

            <LessonSections
                sections={lesson.sections}
                courseId={lesson.course_id}
            />
        </div>
    )
}
