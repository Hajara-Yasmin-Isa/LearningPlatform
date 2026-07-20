'use client'

import { Fragment } from 'react'
import CalloutIcon from './CalloutIcon'
import { parseCallouts } from '@/lib/content/parseCallouts'

interface SectionContentProps {
  content: string | null
}

export default function SectionContent({ content }: SectionContentProps) {
  if (!content) return null

  const paragraphs = content.split(/\n\s*\n/)

  return (
    <div className="text-gray-700 leading-relaxed mb-4 space-y-4">
      {paragraphs.map((paragraph, pIndex) => {
        const segments = parseCallouts(paragraph)
        return (
          <p key={pIndex}>
            {segments.map((segment, sIndex) =>
              segment.type === 'text' ? (
                <Fragment key={sIndex}>{segment.value}</Fragment>
              ) : (
                <CalloutIcon key={sIndex} kind={segment.kind} text={segment.value} />
              )
            )}
          </p>
        )
      })}
    </div>
  )
}
