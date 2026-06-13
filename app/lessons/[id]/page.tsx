import { getLessonWithSections } from "@/lib/supabase/lessons"

export default async function LessonViewerPage({ params }: { params: Promise<{ id: string }> }) {

    //Store lesson id
    const { id } = await params

    //UI Skeleton
    return (
        <div>
            <h1 className="text-2x1 font-bold">getLessonWithSections(id)</h1>
        </div>
    )
} 