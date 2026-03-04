'use client'

import { useState } from 'react'
import { ClassCard } from './ClassCard'
import { CreateLessonTab } from './CreateLessonTab'
import { AnalyticsTab } from './AnalyticsTab'
import { ManageStudentsTab } from './ManageStudentsTab'

const DUMMY_CLASSES = [
  { className: 'Python Fundamentals', studentCount: 28, activeStudentCount: 19 },
  { className: 'Web Dev 101', studentCount: 35, activeStudentCount: 22 },
  { className: 'Data Structures & Algorithms', studentCount: 22, activeStudentCount: 14 },
  { className: 'Intro to Machine Learning', studentCount: 18, activeStudentCount: 6 },
]

type Tab = 'create-lesson' | 'analytics' | 'manage-students'

const TABS: { id: Tab; label: string }[] = [
  { id: 'create-lesson', label: 'Create Lesson' },
  { id: 'analytics', label: 'View Analytics' },
  { id: 'manage-students', label: 'Manage Students' },
]

const QUICK_ACTIONS = [
  {
    label: 'New Lesson',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    label: 'Schedule Class',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
  },
  {
    label: 'Add Students',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    color: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
  },
  {
    label: 'Export Report',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    color: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
  },
]

export function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('create-lesson')

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Prof. Johnson</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${action.color}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* My Classes section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Classes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DUMMY_CLASSES.map((cls) => (
            <ClassCard
              key={cls.className}
              className={cls.className}
              studentCount={cls.studentCount}
              activeStudentCount={cls.activeStudentCount}
            />
          ))}
        </div>
      </section>

      {/* Tabbed interface */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'create-lesson' && <CreateLessonTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'manage-students' && <ManageStudentsTab />}
        </div>
      </section>
    </div>
  )
}
