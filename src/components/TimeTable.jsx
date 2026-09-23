import { useState } from 'react'
import { CourseModal } from './CourseModal'
import { DaySelector } from './DaySelector'
import './Timetable.css'

const DAYS = [
  { value: 1, label: 'Hétfő' },
  { value: 2, label: 'Kedd' },
  { value: 3, label: 'Szerda' },
  { value: 4, label: 'Csütörtök' },
  { value: 5, label: 'Péntek' },
]

const START_HOUR = 8
const END_HOUR = 20

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const groupOverlapping = (sessions) => {
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  )
  const clusters = []
  for (const session of sorted) {
    const start = timeToMinutes(session.start_time)
    const end = timeToMinutes(session.end_time)
    const targetCluster = clusters.find((cluster) =>
      cluster.some((s) => {
        const sStart = timeToMinutes(s.start_time)
        const sEnd = timeToMinutes(s.end_time)
        return start < sEnd && sStart < end
      })
    )
    if (targetCluster) {
      targetCluster.push(session)
    } else {
      clusters.push([session])
    }
  }
  return clusters
}

export const TimeTable = ({ courses }) => {
  const [selectedSession, setSelectedSession] = useState(null)
  const [viewMode, setViewMode] = useState('week') // 'week' vagy 'day'
  const [selectedDay, setSelectedDay] = useState(1)

  const allSessions = courses.flatMap((course) =>
    (course.sessions || []).map((session) => ({
      ...session,
      courseName: course.name,
      courseCode: course.code,
      instructor: course.instructor,
      color: course.color,
    }))
  )

  const totalMinutes = (END_HOUR - START_HOUR) * 60
  const daysToShow = viewMode === 'day' ? DAYS.filter((d) => d.value === selectedDay) : DAYS

  return (
    <div className="timetable">
      <div className="view-toggle">
        <button
          className={viewMode === 'week' ? 'active' : ''}
          onClick={() => setViewMode('week')}
        >
          Heti nézet
        </button>
        <button
          className={viewMode === 'day' ? 'active' : ''}
          onClick={() => setViewMode('day')}
        >
          Napi nézet
        </button>
      </div>

      {viewMode === 'day' && (
        <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      )}

      <div className="timetable-header" style={{ gridTemplateColumns: `60px repeat(${daysToShow.length}, 1fr)` }}>
        <div className="time-col-header"></div>
        {daysToShow.map((day) => (
          <div key={day.value} className="day-header">{day.label}</div>
        ))}
      </div>

      <div className="timetable-body" style={{ gridTemplateColumns: `60px repeat(${daysToShow.length}, 1fr)` }}>
        <div className="time-col">
          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
            <div key={i} className="time-label">
              {String(START_HOUR + i).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {daysToShow.map((day) => {
          const daySessions = allSessions.filter((s) => s.day_of_week === day.value)
          const clusters = groupOverlapping(daySessions)

          return (
            <div key={day.value} className="day-col">
              {clusters.map((cluster, i) => {
                const clusterStart = Math.min(...cluster.map((s) => timeToMinutes(s.start_time)))
                const clusterEnd = Math.max(...cluster.map((s) => timeToMinutes(s.end_time)))
                const top = ((clusterStart - START_HOUR * 60) / totalMinutes) * 100
                const height = ((clusterEnd - clusterStart) / totalMinutes) * 100

                return (
                  <div
                    key={i}
                    className="cluster-wrapper"
                    style={{ top: `${top}%`, height: `${height}%` }}
                  >
                    {cluster.map((session) => {
                      const innerTop = ((timeToMinutes(session.start_time) - clusterStart) / (clusterEnd - clusterStart)) * 100
                      const innerHeight = ((timeToMinutes(session.end_time) - timeToMinutes(session.start_time)) / (clusterEnd - clusterStart)) * 100

                      return (
                        <div
                          key={session.id}
                          className="session-block"
                          style={{
                            top: `${innerTop}%`,
                            height: `${innerHeight}%`,
                            backgroundColor: session.color || '#3b82f6',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedSession(session)}
                        >
                          <strong>{session.courseName}</strong>
                          <div>{session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <CourseModal session={selectedSession} onClose={() => setSelectedSession(null)} />
    </div>
  )
}