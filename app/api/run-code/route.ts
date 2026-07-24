import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { runCode } from '@/learning-engine/code-runner/runCode';
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
        const { code, language, functionName, testCases } = body;

        if (typeof code !== 'string' || typeof language !== 'string') {
            return NextResponse.json(
                { error: 'code and language are required' }, { status: 400 }
            );
        }

        if (code.length > MAX_CODE_LENGTH) {
            return NextResponse.json(
                { error: 'Code is too long.' }, { status: 400 }
            );
        }

        // ?? undefined so the database's nulls become the optional params runCode expects
        const result = await runCode(code, language, functionName ?? undefined, testCases ?? undefined);
        return NextResponse.json(result);

    } catch (e) {
        return NextResponse.json(
            { error: 'Request failed' }, { status: 500 }
        )
    }
}
