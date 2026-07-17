import type { CalloutKind } from '@/components/features/lessons/CalloutIcon'

export type ContentSegment =
  | { type: 'text'; value: string }
  | { type: 'callout'; kind: CalloutKind; value: string }

// Inline callout markers embedded in section content, e.g.
// "...misali [[tip:PYTHON baya buƙatar fadar nau'in bayanai.]] domin..."
const CALLOUT_PATTERN = /\[\[(tip|note|check):([^\]]*)\]\]/g

export function parseCallouts(text: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  CALLOUT_PATTERN.lastIndex = 0
  while ((match = CALLOUT_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'callout', kind: match[1] as CalloutKind, value: match[2].trim() })
    lastIndex = CALLOUT_PATTERN.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return segments
}
