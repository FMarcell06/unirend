import { useEffect, useState } from 'react'
import { CourseModal } from './CourseModal'
import { DayNav } from './DayNav'
import { useIsMobile } from '../useIsMobile'
import { getDayMessage } from '../dayMessages'
import './Timetable.css'

const DAYS = [
  { value: 1, label: 'Hétfő', short: 'Hé' },
  { value: 2, label: 'Kedd', short: 'Ke' },
  { value: 3, label: 'Szerda', short: 'Sze' },
  { value: 4, label: 'Csütörtök', short: 'Cs' },
  { value: 5, label: 'Péntek', short: 'Pé' },
]

const START_HOUR = 8
const END_HOUR = 20

// közös nézet két színe (inline, hogy semmilyen CSS ne írhassa felül)
const DUO_BACKGROUND = {
  mine: 'linear-gradient(135deg, #0a84ff, #5ac8fa)',
  friend: 'linear-gradient(135deg, #8b5cf6, #c084fc)',
}

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
    const target = clusters.find((cluster) =>
      cluster.some((s) => {
        const sStart = timeToMinutes(s.start_time)
        const sEnd = timeToMinutes(s.end_time)
        return start < sEnd && sStart < end
      })
    )
    if (target) target.push(session)
    else clusters.push([session])
  }
  return clusters
}

export const TimeTable = ({ courses, colorMode = 'custom' }) => {
  const isDuo = colorMode === 'duo'
  const isMobile = useIsMobile()

  const now = new Date()
  const todayValue = now.getDay() // 0 = vasárnap
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const [selectedSession, setSelectedSession] = useState(null)
  const [viewMode, setViewMode] = useState(isMobile ? 'day' : 'week')
  const [selectedDay, setSelectedDay] = useState(todayValue >= 1 && todayValue <= 5 ? todayValue : 1)

  // ha átlépjük a töréspontot (pl. telefon elforgatása), a nézet igazodik
  useEffect(() => {
    setViewMode(isMobile ? 'day' : 'week')
  }, [isMobile])

  const allSessions = courses.flatMap((course) =>
    (course.sessions || []).map((session) => ({
      ...session,
      courseName: course.name,
      courseCode: course.code,
      instructor: course.instructor,
      color: course.color,
      isMine: course.isMine,
    }))
  )

  const totalMinutes = (END_HOUR - START_HOUR) * 60
  const hourCount = END_HOUR - START_HOUR
  const isDayView = viewMode === 'day'
  const daysToShow = isDayView ? DAYS.filter((d) => d.value === selectedDay) : DAYS

  const nowTop = ((nowMinutes - START_HOUR * 60) / totalMinutes) * 100
  const showNow = nowTop >= 0 && nowTop <= 100

  // az üzenet a saját napodról szól, ezért a közös nézetben nem jelenik meg
  const dayMessage = isDuo
    ? null
    : getDayMessage({
        sessions: allSessions.filter((s) => s.day_of_week === selectedDay && s.isMine !== false),
        dayValue: selectedDay,
        isToday: selectedDay === todayValue,
      })

  const getBlockBackground = (session) => {
    if (isDuo) return session.isMine === false ? DUO_BACKGROUND.friend : DUO_BACKGROUND.mine
    return session.color || '#3b82f6'
  }

  const columns = `var(--time-col) repeat(${daysToShow.length}, minmax(0, 1fr))`

  return (
    <div className="timetable">
      <div className="view-toggle">
        <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>
          Heti nézet
        </button>
        <button className={viewMode === 'day' ? 'active' : ''} onClick={() => setViewMode('day')}>
          Napi nézet
        </button>
      </div>

      {isDayView ? (
        <DayNav
          days={DAYS}
          selectedDay={selectedDay}
          onChange={setSelectedDay}
          todayValue={todayValue}
          message={dayMessage}
        />
      ) : (
        <div className="timetable-header" style={{ gridTemplateColumns: columns }}>
          <div />
          {DAYS.map((day) => (
            <div key={day.value} className={`day-header ${day.value === todayValue ? 'is-today' : ''}`}>
              <span className="day-full">{day.label}</span>
              <span className="day-short">{day.short}</span>
            </div>
          ))}
        </div>
      )}

      <div className="timetable-body" style={{ gridTemplateColumns: columns, '--hour-count': hourCount }}>
        <div className="time-col">
          {Array.from({ length: hourCount }, (_, i) => (
            <div key={i} className="time-label">
              {String(START_HOUR + i).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {daysToShow.map((day) => {
          const clusters = groupOverlapping(allSessions.filter((s) => s.day_of_week === day.value))

          return (
            <div key={day.value} className={`day-col ${day.value === todayValue ? 'is-today' : ''}`}>
              {clusters.map((cluster, i) => {
                const clusterStart = Math.min(...cluster.map((s) => timeToMinutes(s.start_time)))
                const clusterEnd = Math.max(...cluster.map((s) => timeToMinutes(s.end_time)))
                const top = ((clusterStart - START_HOUR * 60) / totalMinutes) * 100
                const height = ((clusterEnd - clusterStart) / totalMinutes) * 100

                return (
                  <div key={i} className="cluster-wrapper" style={{ top: `${top}%`, height: `${height}%` }}>
                    {cluster.map((session) => {
                      const span = clusterEnd - clusterStart
                      const innerTop = ((timeToMinutes(session.start_time) - clusterStart) / span) * 100
                      const innerHeight =
                        ((timeToMinutes(session.end_time) - timeToMinutes(session.start_time)) / span) * 100

                      return (
                        <div
                          key={session.id}
                          className="session-block"
                          style={{
                            top: `${innerTop}%`,
                            height: `${innerHeight}%`,
                            background: getBlockBackground(session),
                          }}
                          onClick={() => setSelectedSession(session)}
                        >
                          <strong>{session.courseName}</strong>
                          <div className="session-time">
                            {session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}
                          </div>
                          {session.room && <div className="session-room">{session.room}</div>}
                        </div>
                      )
                    })}
                  </div>
                )
              })}

              {day.value === todayValue && showNow && (
                <div className="now-line" style={{ top: `${nowTop}%` }} />
              )}
            </div>
          )
        })}
      </div>

      <CourseModal session={selectedSession} onClose={() => setSelectedSession(null)} />
    </div>
  )
}