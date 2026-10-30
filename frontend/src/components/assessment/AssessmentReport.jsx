import { useState } from 'react'

const SIGNAL_GROUPS = [
  { key: 'phone', label: 'Phone', color: '#e11d48' },
  { key: 'people', label: 'People', color: '#d97706' },
  { key: 'absent', label: 'Face absent', color: '#ea580c' },
  { key: 'looking', label: 'Looking away', color: '#0284c7' },
]

const EVENT_LABELS = {
  phone_detected: 'Phone detected',
  multiple_people: 'Multiple people',
  face_absent: 'Face absent',
  looking_left: 'Looking left',
  looking_right: 'Looking right',
  looking_up: 'Looking up',
  looking_down: 'Looking down',
  eyes_closed: 'Eyes closed',
}

const EVENT_COLORS = {
  phone_detected: '#e11d48',
  multiple_people: '#d97706',
  face_absent: '#ea580c',
  looking_left: '#0284c7',
  looking_right: '#0ea5e9',
  looking_up: '#38bdf8',
  looking_down: '#7dd3fc',
  eyes_closed: '#8b5cf6',
}

const SECTION_COLORS = ['#4f46e5', '#0284c7', '#059669', '#d97706', '#e11d48', '#7c3aed']

function levelStyles(level) {
  if (level === 'HIGH SUSPICION') {
    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
  }
  if (level === 'MEDIUM SUSPICION') {
    return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300'
  }
  if (level === 'LOW SUSPICION') {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
}

function formatSegmentValue(segment, percent) {
  if (segment.detail) return segment.detail
  if (segment.unit) {
    const suffix = segment.value === 1 ? '' : 's'
    return `${segment.value} ${segment.unit}${suffix} · ${percent}%`
  }
  return `${percent}%`
}

function readableColor(color) {
  return typeof color === 'string' && color.startsWith('rgba') ? '#64748b' : color
}

function DonutChart({ segments, centerValue, centerLabel, size = 168, thickness = 16 }) {
  const [selectedLabel, setSelectedLabel] = useState(null)
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0)
  const radius = 50 - (thickness + 3) / 2
  const circumference = 2 * Math.PI * radius
  let runningOffset = 0
  const arcs = segments.map((segment) => {
    const value = Math.max(0, segment.value)
    const length = total > 0 ? (value / total) * circumference : 0
    const arc = { ...segment, length, offset: runningOffset }
    runningOffset += length
    return arc
  })
  const selected = arcs.find((arc) => arc.label === selectedLabel) || null
  const selectedPercent = selected && total > 0
    ? Math.round((Math.max(0, selected.value) / total) * 100)
    : 0
  const selectedIsHex = selected ? /^#([0-9a-f]{6})$/i.test(selected.color) : false
  const segmentPercent = (value) => (total > 0 ? Math.round((Math.max(0, value) / total) * 100) : 0)

  const toggleSegment = (label) => {
    setSelectedLabel((current) => (current === label ? null : label))
  }

  return (
    <div>
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={thickness}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700"
          />
          {total > 0
            ? arcs.filter((arc) => arc.value > 0).map((arc) => {
                const isSelected = selectedLabel === arc.label
                const valueLabel = formatSegmentValue(arc, segmentPercent(arc.value))
                return (
                  <circle
                    key={arc.label}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={isSelected ? thickness + 3 : thickness}
                    strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                    strokeDashoffset={-arc.offset}
                    strokeLinecap="butt"
                    className="cursor-pointer transition-opacity focus:outline-none"
                    style={{ opacity: selectedLabel && !isSelected ? 0.35 : 1 }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${arc.label}: ${valueLabel}`}
                    onClick={() => toggleSegment(arc.label)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        toggleSegment(arc.label)
                      }
                    }}
                  >
                    <title>{`${arc.label}: ${valueLabel}`}</title>
                  </circle>
                )
              })
            : null}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{centerValue}</span>
          {centerLabel ? (
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {centerLabel}
            </span>
          ) : null}
        </div>
      </div>
      {total > 0 && selected ? (
        <div
          className="mt-3 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px]"
          style={{
            borderColor: selectedIsHex ? `${selected.color}55` : '#cbd5e1',
            backgroundColor: selectedIsHex ? `${selected.color}14` : 'rgba(148, 163, 184, 0.12)',
          }}
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: selected.color }} />
          <span className="font-semibold" style={{ color: readableColor(selected.color) }}>
            {selected.label}
          </span>
          <span className="ml-auto text-right font-semibold text-slate-700 dark:text-slate-200">
            {formatSegmentValue(selected, selectedPercent)}
          </span>
          <button
            type="button"
            onClick={() => setSelectedLabel(null)}
            className="ml-1 text-sm leading-none text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Clear selected segment"
          >
            ×
          </button>
        </div>
      ) : null}
      {total > 0 && !selected ? (
        <p className="mt-3 text-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
          Click a colored segment for details
        </p>
      ) : null}
    </div>
  )
}

function LegendList({ items }) {
  return (
    <ul className="mt-5 space-y-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
        </li>
      ))}
    </ul>
  )
}

function BarChart({ items, maxValue = 100, suffix = '' }) {
  const max = Math.max(maxValue, ...items.map((item) => item.value), 1)

  return (
    <div className="flex h-52 items-end gap-3">
      {items.map((item) => {
        const height = item.value > 0 ? Math.max(8, Math.round((item.value / max) * 132)) : 0
        return (
          <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {item.value}
              {suffix}
            </span>
            <div className="flex w-full items-end justify-center" style={{ height: 136 }}>
              <div
                className="w-full max-w-12 rounded-t-lg transition-all"
                style={{ height, backgroundColor: item.color }}
              />
            </div>
            <span className="h-8 text-center text-[10px] leading-4 text-slate-500 dark:text-slate-400">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function buildTimeline(events, startedAt, endedAt) {
  const times = events
    .map((event) => new Date(event.receivedAt).getTime())
    .filter((time) => Number.isFinite(time))
  const parsedStart = new Date(startedAt).getTime()
  const parsedEnd = new Date(endedAt).getTime()
  const first = Number.isFinite(parsedStart) ? parsedStart : times[0] ?? Date.now()
  const last = Number.isFinite(parsedEnd) ? Math.max(parsedEnd, first + 1000) : times[times.length - 1] ?? first + 60000
  const span = Math.max(60000, last - first)
  const bucketCount = Math.max(4, Math.min(8, Math.ceil(span / 60000)))
  const bucketMs = span / bucketCount
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    label: `${Math.round((index * bucketMs) / 60000)}m`,
    count: 0,
  }))

  times.forEach((time) => {
    const index = Math.min(bucketCount - 1, Math.max(0, Math.floor((time - first) / bucketMs)))
    buckets[index].count += 1
  })

  return buckets
}

function InsightCard({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function timeLabel(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function AssessmentReport({ assessmentResult, proctoring, terminated }) {
  const percentage = assessmentResult?.percentage
  const eventCounts = proctoring?.eventCounts || {}
  const phone = eventCounts.phone_detected || 0
  const people = eventCounts.multiple_people || 0
  const absent = eventCounts.face_absent || 0
  const looking =
    (eventCounts.looking_left || 0) +
    (eventCounts.looking_right || 0) +
    (eventCounts.looking_up || 0) +
    (eventCounts.looking_down || 0)
  const signalValues = { phone, people, absent, looking }
  const signalItems = SIGNAL_GROUPS.map((group) => ({
    ...group,
    value: signalValues[group.key] || 0,
  }))
  const totalSignals = signalItems.reduce((sum, item) => sum + item.value, 0)
  const suspicionScore = proctoring?.score || 0
  const suspicionLevel = proctoring?.level || 'NORMAL'
  const suspicionPercent = Math.min(100, Math.round((suspicionScore / 12) * 100))
  const events = proctoring?.events || []
  const timeline = buildTimeline(events, proctoring?.startedAt, proctoring?.endedAt)
  const sections = (assessmentResult?.sections || []).map((section, index) => ({
    label: section.name,
    value: section.percentage,
    color: SECTION_COLORS[index % SECTION_COLORS.length],
  }))
  const questionResults = assessmentResult?.questionResults || []
  const correctCount = questionResults.length > 0
    ? questionResults.filter((question) => question.isCorrect).length
    : assessmentResult?.score ?? 0
  const incorrectCount = Math.max(0, (assessmentResult?.total ?? 0) - correctCount)

  const totalQuestions = assessmentResult?.total ?? correctCount + incorrectCount
  const scoreSegments =
    typeof percentage === 'number'
      ? [
          {
            label: 'Correct',
            value: percentage,
            color: '#059669',
            detail: `${correctCount} of ${totalQuestions} answers correct`,
          },
          {
            label: 'Missed',
            value: Math.max(0, 100 - percentage),
            color: 'rgba(148, 163, 184, 0.25)',
            detail: `${incorrectCount} of ${totalQuestions} answers missed`,
          },
        ]
      : []

  const suspicionSegments = [
    {
      label: 'Suspicion',
      value: suspicionPercent,
      color: suspicionPercent >= 67 ? '#e11d48' : suspicionPercent >= 34 ? '#d97706' : '#059669',
      detail: `${suspicionScore} risk point${suspicionScore === 1 ? '' : 's'} · ${suspicionPercent}% risk`,
    },
    {
      label: 'Remaining',
      value: Math.max(0, 100 - suspicionPercent),
      color: 'rgba(148, 163, 184, 0.25)',
      detail: `${Math.max(0, 100 - suspicionPercent)}% of risk scale unused`,
    },
  ]

  const signalSegments = signalItems
    .filter((item) => item.value > 0)
    .map((item) => ({ label: item.label, value: item.value, color: item.color, unit: 'detection' }))

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            Combined report
          </p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Score and AI proctoring analysis</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {proctoring?.status && proctoring.status !== 'active' ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              AI stream was offline
            </span>
          ) : null}
          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${levelStyles(suspicionLevel)}`}>
            {terminated ? 'Terminated' : suspicionLevel}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            Assignment score
          </p>
          <div className="mt-4">
            {typeof percentage === 'number' ? (
              <DonutChart
                segments={scoreSegments}
                centerValue={`${percentage}%`}
                centerLabel={`${correctCount} of ${assessmentResult.total} correct`}
              />
            ) : (
              <DonutChart segments={[]} centerValue="—" centerLabel="Score pending" />
            )}
          </div>
          <LegendList
            items={[
              { label: 'Correct', value: correctCount, color: '#059669' },
              { label: 'Missed', value: incorrectCount, color: '#94a3b8' },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            Proctoring suspicion
          </p>
          <div className="mt-4">
            <DonutChart
              segments={suspicionSegments}
              centerValue={suspicionScore}
              centerLabel={`${suspicionPercent}% risk`}
            />
          </div>
          <LegendList
            items={[
              { label: 'AI events', value: proctoring?.totalEvents ?? totalSignals, color: '#e11d48' },
              { label: 'Tab / fullscreen warnings', value: proctoring?.tabViolations ?? 0, color: '#d97706' },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            Cheating signal mix
          </p>
          <div className="mt-4">
            <DonutChart
              segments={signalSegments.length > 0 ? signalSegments : []}
              centerValue={totalSignals}
              centerLabel={totalSignals === 0 ? 'No violations' : 'AI events'}
            />
          </div>
          <LegendList items={signalItems} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Violations by type</p>
            <span className="text-xs text-slate-500 dark:text-slate-400">count</span>
          </div>
          <div className="mt-4">
            <BarChart items={signalItems} maxValue={Math.max(...signalItems.map((item) => item.value), 1)} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Incident timeline</p>
            <span className="text-xs text-slate-500 dark:text-slate-400">events per interval</span>
          </div>
          {totalSignals > 0 ? (
            <div className="mt-4">
              <BarChart
                items={timeline.map((bucket, index) => ({
                  label: bucket.label,
                  value: bucket.count,
                  color: SECTION_COLORS[index % SECTION_COLORS.length],
                }))}
                maxValue={Math.max(...timeline.map((bucket) => bucket.count), 1)}
              />
            </div>
          ) : (
            <div className="mt-4 flex h-52 items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-4 text-center text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              No cheating signals were recorded during this assessment.
            </div>
          )}
        </div>
      </div>

      {sections.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Section performance</p>
            <span className="text-xs text-slate-500 dark:text-slate-400">percent correct</span>
          </div>
          <div className="mt-4">
            <BarChart items={sections} maxValue={100} suffix="%" />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Detected activity log</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {events.length === 0
              ? 'No events'
              : `Showing ${events.length} of ${proctoring?.totalEvents ?? events.length} events`}
          </span>
        </div>

        {events.length === 0 ? (
          <div className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${proctoring?.status && proctoring.status !== 'active' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
            {proctoring?.status && proctoring.status !== 'active'
              ? 'AI proctoring was offline at submission, so a clean camera check could not be confirmed.'
              : 'Clean camera session. No phone, multiple-person, face-absence, or gaze violations were detected.'}
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <th className="px-2 py-2 font-semibold">Time</th>
                  <th className="px-2 py-2 font-semibold">Signal</th>
                  <th className="px-2 py-2 font-semibold">Details</th>
                  <th className="px-2 py-2 font-semibold">Confidence</th>
                  <th className="px-2 py-2 font-semibold">Points</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id || `${event.type}-${event.receivedAt}`} className="border-b border-slate-100 last:border-0 dark:border-slate-700/60">
                    <td className="whitespace-nowrap px-2 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                      {timeLabel(event.receivedAt)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: EVENT_COLORS[event.type] || '#64748b' }}
                        />
                        {EVENT_LABELS[event.type] || event.type}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                      {event.description || 'Activity detected'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                      {typeof event.confidence === 'number' && event.confidence > 0
                        ? `${Math.round(event.confidence * 100)}%`
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      +{event.contribution ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {assessmentResult ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <InsightCard title="Strengths" items={assessmentResult.strengths} />
          <InsightCard title="Skill gaps" items={assessmentResult.skillGaps} />
          <InsightCard title="Recommended roles" items={assessmentResult.recommendedRoles} />
          <InsightCard title="Recommended industries" items={assessmentResult.recommendedIndustries} />
        </div>
      ) : null}
    </div>
  )
}
