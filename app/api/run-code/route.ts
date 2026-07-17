import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { runCode, getExercise } from '@/learning-engine/code-runner/runCode';
import { rateLimit } from '@/lib/rateLimit';

const MAX_CODE_LENGTH = 10_000;

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
        if (!rateLimit(`run-code:${ip}`, 20, 60_000)) {
            return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
        }

        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json();
        const { code } = body;

        if (typeof code !== 'string') {
            return NextResponse.json(
                { error: "Couldn't read code. Re-type your solution in the editor." }, { status: 400 }
            );
        }

        if (code.length > MAX_CODE_LENGTH) {
            return NextResponse.json(
                { error: 'Code is too long.' }, { status: 400 }
            );
        }

        const result = runCode(code, getExercise());
        return NextResponse.json(result);

    } catch (e) {
        return NextResponse.json(
            { error: 'Request failed' }, { status: 500 }
        )
    }
}
