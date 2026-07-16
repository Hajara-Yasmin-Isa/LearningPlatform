import Link from 'next/link'

const faqs = [
  {
    q: 'How do I enroll in a course?',
    a: 'Go to the Courses page, click on a course you want to take, then click the "Enroll" button on the course detail page. You need to be logged in to enroll.',
  },
  {
    q: 'How is my progress saved?',
    a: 'Your progress is saved automatically as you complete each section. When you return to a lesson, it will resume from where you left off.',
  },
  {
    q: 'What types of exercises are there?',
    a: 'Lessons include multiple choice questions, short answer questions, and coding exercises where you write and run real code.',
  },
  {
    q: 'How do I submit beta feedback?',
    a: 'Click the "Feedback" button in the bottom-right corner of any page. You can report bugs, share suggestions, or send general feedback.',
  },
  {
    q: 'I found a bug. What should I do?',
    a: 'Use the Feedback button and select "Bug" from the dropdown. Describe what happened and what page you were on — that helps us fix it quickly.',
  },
]

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Help</h1>
      <p className="text-slate-500 mb-10">
        Answers to common questions about Littafin Fasaha beta.
      </p>

      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.q} className="glass rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-2">{faq.q}</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-slate-500 text-sm mb-4">Still have a question?</p>
        <Link
          href="/contact"
          className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          Contact us
        </Link>
      </div>
    </div>
  )
}
