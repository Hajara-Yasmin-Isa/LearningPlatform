'use client'

import { useState } from 'react'
import type { Lesson, Section } from '@/types/database'

// What the form holds while the instructor types. Controlled inputs need strings, never
// null, so this is deliberately not the database Section type. `id` is a client-only key
// so React can follow a section while it moves; the real id is assigned on save.
interface DraftSection {
  id: string
  title: string
  content: string
}

// What Check logs today and the save function receives in sprint 3 (A3.1). Built from the
// database types on purpose: if a column is renamed, this file stops compiling instead of
// the save failing at runtime. course_id and lesson_order are left out because they come
// from the Course selector, which is still a placeholder below.
type LessonDraft = Pick<Lesson, 'title' | 'description'> & {
  sections: Pick<Section, 'title' | 'content' | 'section_order'>[]
}

interface FormErrors {
  title?: string
  sections?: string
}

// crypto.randomUUID only exists in a secure context (https, or localhost). Opening a dev
// server from a phone over plain http on the LAN would otherwise crash the whole tab.
function newId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

function newSection(): DraftSection {
  return { id: newId(), title: '', content: '' }
}

// Optional text columns are null in the database, not ''. Converting here keeps the
// logged object identical to what sprint 3 will insert.
function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function toLessonDraft(title: string, description: string, sections: DraftSection[]): LessonDraft {
  return {
    title: title.trim(),
    description: emptyToNull(description),
    sections: sections.map((s, i) => ({
      title: s.title.trim(),
      content: emptyToNull(s.content),
      section_order: i + 1,
    })),
  }
}

const inputClass =
  'w-full h-10 bg-white rounded-lg border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600'
const textareaClass =
  'w-full bg-white rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none'
const smallButtonClass =
  'px-2 py-1 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'

export function CreateLessonTab() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  // The function form runs once, on the first render. Passing `[newSection()]` directly
  // would build a fresh section (and a fresh id) on every render, only to throw it away.
  const [sections, setSections] = useState<DraftSection[]>(() => [newSection()])
  const [errors, setErrors] = useState<FormErrors>({})

  // Sections are found by id, not by index: the id is what identifies a section once the
  // list can be reordered (the same reason the React key is the id and not the title).
  function updateSection(id: string, patch: Partial<Pick<DraftSection, 'title' | 'content'>>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSections((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function handleValidate() {
    const newErrors: FormErrors = {}
    if (title.trim() === '') newErrors.title = 'A title is required'
    if (sections.length === 0) newErrors.sections = 'Add at least one section'
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      console.log(toLessonDraft(title, description, sections))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Create a New Lesson</h3>
        <p className="text-sm text-gray-500">Fill in the details below to draft and publish a lesson.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          {/* htmlFor + id links the label to its field: clicking the label focuses the input,
              and a screen reader announces the field by name instead of "edit text". */}
          <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700">Lesson Title</label>
          <input
            id="lesson-title"
            className={inputClass}
            placeholder="Enter lesson title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
        </div>
        <div className="space-y-1">
          {/* Placeholder until A3.1: saving needs a course_id, so the selector arrives with saving. */}
          <label className="block text-sm font-medium text-gray-700">Course</label>
          <div className="w-full h-10 bg-gray-100 rounded-lg border border-gray-200" />
          <p className="text-xs text-gray-400">Course selection arrives with saving</p>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="lesson-description" className="block text-sm font-medium text-gray-700">Lesson Description</label>
        <textarea
          id="lesson-description"
          className={textareaClass}
          rows={4}
          placeholder="Enter lesson description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* A fieldset groups the section cards under one caption; a <label> with no field
          to point at is not the right element for a heading. */}
      <fieldset className="space-y-3">
        <legend className="block text-sm font-medium text-gray-700 mb-3">Sections</legend>
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="p-4 space-y-3 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Section {index + 1}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={smallButtonClass}
                  disabled={index === 0}
                  aria-label={`Move section ${index + 1} up`}
                  onClick={() => moveSection(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={smallButtonClass}
                  disabled={index === sections.length - 1}
                  aria-label={`Move section ${index + 1} down`}
                  onClick={() => moveSection(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={smallButtonClass}
                  onClick={() => removeSection(section.id)}
                >
                  Remove
                </button>
              </div>
            </div>
            <label htmlFor={`section-${section.id}-title`} className="sr-only">Section {index + 1} title</label>
            <input
              id={`section-${section.id}-title`}
              type="text"
              placeholder="Section title"
              className={inputClass}
              value={section.title}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
            />
            <label htmlFor={`section-${section.id}-content`} className="sr-only">Section {index + 1} content</label>
            <textarea
              id={`section-${section.id}-content`}
              rows={4}
              placeholder="Section content"
              className={textareaClass}
              value={section.content}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
            />
          </div>
        ))}
        <button
          type="button"
          className={smallButtonClass}
          onClick={() => setSections((prev) => [...prev, newSection()])}
        >
          Add Section
        </button>
        {errors.sections && <p className="text-sm text-red-600">{errors.sections}</p>}
      </fieldset>

      <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
          Save lesson
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          onClick={handleValidate}
        >
          Check lesson
        </button>
        <p className="text-sm text-gray-500">Saving arrives next sprint</p>
      </div>
    </div>
  )
}
