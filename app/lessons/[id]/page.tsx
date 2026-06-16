import { getLessonWithSections } from "@/lib/supabase/lessons"
import { supabase } from "@/lib/supabase/client"
import { notFound } from "next/navigation"
import ExerciseBlock from "@/components/features/lessons/ExerciseBlock"

//Temporary fix imports
import { createServerClient } from '@/lib/supabase/server'
import { Exercise, Section } from "@/types/database"


export default async function LessonViewerPage({ params }: { params: Promise<{ id: string }> }) {

    //Store lesson id
    const { id } = await params
                 
    /*  //Production solution with getLessonWithSections(id)
        //Grab lesson
        const lesson = await getLessonWithSections(id)
    
        
        //If lesson not found, notFound()
        if (!lesson) {
            notFound()
        }
    */

    //Temporary fix
    const supabase = await createServerClient()

    const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('lesson_order', { ascending: true })

    //Show error user-side
    if (error) {
        return <p>{error.message}</p>
    }

    if (!lessons) notFound()

    //Return data for troubleshooting
    return (
        <pre>
            {JSON.stringify({ count: lessons?.length, lessons, error }, null, 2)}
        </pre>
    )
    ///////////////////////////////////////////////////////////////////////////////
    /*                    ^   Figuring out Lessons table issue  ^                */

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
            <h1 className="text-2x1 font-bold">{lessons.title}</h1>
            <div>
                {lesson.sections.map((section: Section) => (
                    <div key={section.id}>
                        <h2>{section.title}</h2>
                        <p>{section.content}</p>


                        {section.exercises.map((exercise: Exercise) => (
                            <ExerciseBlock
                                key={exercise.id}
                                exercise={exercise}
                                onComplete={() => { }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
} 