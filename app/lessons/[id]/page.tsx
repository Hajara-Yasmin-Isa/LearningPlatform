import { getLessonWithSections } from "@/lib/supabase/lessons"
import { supabase } from "@/lib/supabase/client"
import { notFound } from "next/navigation"
import ExerciseBlock from "@/components/features/lessons/ExerciseBlock"

export default async function LessonViewerPage({ params }: { params: Promise<{ id: string }> }) {

    //Store lesson id
    const { id } = await params

    //Grab lesson
    const lesson = await getLessonWithSections(id)

    //If lesson not found, notFound()
    if (!lesson) {
        notFound()
    }

    //Store user data
    //Server-side auth will be added Sprint 2 according to Trello Card, so probably will be adjusted
    const {
        data: { user },
    } = await supabase.auth.getUser()

    //Store userID (if applicable)
    const userId = user?.id ?? null

    //UI Skeleton
    return (
        <div>
            <h1 className="text-2x1 font-bold">{lesson.title}</h1>
            <div>
                {lesson.sections.map((section) => (
                    <div key={section.id}>
                        <h2>{section.title}</h2>
                        <p>{section.content}</p>

                        {section.exercises.map((exercise) => (
                            <ExerciseBlock
                                key={exercise.id}
                                exercise={exercise}
                                onComplete={() => {}}
                                />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
} 