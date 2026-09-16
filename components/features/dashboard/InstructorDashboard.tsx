'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  getInstructorCourses,
  getCourseEnrollments,
  getCourseCompletionRate,
} from '@/lib/supabase/instructor'
import { CourseWithInstructor } from '@/types/database'
import { CreateLessonTab } from './CreateLessonTab'
import { AnalyticsTab } from './AnalyticsTab'
import { ManageStudentsTab } from './ManageStudentsTab'

interface CourseAnalytics {
  course: CourseWithInstructor
  enrolledCount: number
  completionRate: number
}

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
  const [courses, setCourses] = useState<CourseAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUserName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '')

      try {
        const instructorCourses = await getInstructorCourses(user.id)
        const withAnalytics = await Promise.all(
          instructorCourses.map(async (course) => {
            const [enrollments, completionRate] = await Promise.all([
              getCourseEnrollments(course.id),
              getCourseCompletionRate(course.id),
            ])
            return { course, enrolledCount: enrollments.count, completionRate }
          })
        )
        setCourses(withAnalytics)
      } catch (err) {
        console.error('[InstructorDashboard]', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-500">Ana loda ajujuwanka...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back{userName ? `, ${userName}` : ''}
          </p>
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

        {courses.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-100 rounded-xl">
            <p className="text-gray-500 text-sm">You don&apos;t have any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map(({ course, enrolledCount, completionRate }) => (
              <div
                key={course.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      course.published
                        ? 'text-green-700 bg-green-100'
                        : 'text-gray-600 bg-gray-100'
                    }`}
                  >
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-3 leading-snug">{course.title}</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Enrolled students</span>
                    <span className="font-medium text-gray-900">{enrolledCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Lessons</span>
                    <span className="font-medium text-gray-900">{course.lessonCount}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Completion</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
