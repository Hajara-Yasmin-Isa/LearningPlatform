import { NextResponse } from 'next/server';
// For Sprint1 using hard-coded sampleExercise which you access through getExercise
import { runCode, getExercise } from '@/learning-engine/code-runner/runCode';

export async function POST(request: Request) {
    try {
        // expected body shape: { code: "..." }
        const body = await request.json();
        const {code} = body;

        // If code is missing or not a string return 400
        if (typeof code !== 'string') {
            return NextResponse.json(
                {error: "Couldn't read code. Re-type your solution in the editor."}, {status: 400}
            );
        }
        const result = runCode(code, getExercise());
        return NextResponse.json(result);

    } catch (e) {
        return NextResponse.json(
            {error: "Request failed" }, {status: 500}
        )
    }
}
