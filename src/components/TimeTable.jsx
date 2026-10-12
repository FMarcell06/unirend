import { useEffect, useState } from 'react'
import { CourseModal } from './CourseModal'
import { CourseFormModal } from './CourseFormModal'
import { DayNav } from './DayNav'
import { useIsMobile } from '../useIsMobile'
import { getDayMessage } from '../dayMessages'
import { useCurrentParity, occursInWeek, PARITY_LABEL } from '../week'
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

export const DEFAULT_DUO_COLORS = { mine: '#0a84ff', friend: '#8b5cf6' }

// a választott színből gradiens: a másik vége világosabb árnyalat
const toGradient = (color) =>
  `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 68%, white))`

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

export const TimeTable = ({ courses, colorMode = 'custom', duoColors = DEFAULT_DUO_COLORS, onChanged }) => {
  const isDuo = colorMode === 'duo'
  const isMobile = useIsMobile()

  const now = new Date()
  const todayValue = now.getDay() // 0 = vasárnap
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const currentParity = useCurrentParity()
  const [viewParity, setViewParity] = useState(currentParity)

  // új hét kezdetekor visszaáll az aktuális hétre
  useEffect(() => {
    setViewParity(currentParity)
  }, [currentParity])

  const [selectedSession, setSelectedSession] = useState(null)
  const [editing, setEditing] = useState(null) // { course, sessionId }
  const [viewMode, setViewMode] = useState(isMobile ? 'day' : 'week')
  const [selectedDay, setSelectedDay] = useState(todayValue >= 1 && todayValue <= 5 ? todayValue : 1)

  // ha átlépjük a töréspontot (pl. telefon elforgatása), a nézet igazodik
  useEffect(() => {
    setViewMode(isMobile ? 'day' : 'week')
  }, [isMobile])

const sessionsOfAllWeeks = courses.flatMap((course) =>
  (course.sessions || []).map((session) => ({
    ...session,
    courseId: course.id,
    courseName: course.name,
    courseCode: course.code,
    instructor: course.instructor,
    color: course.color,
    isMine: course.isMine,
  }))
)

// csak a kiválasztott hét órái; az allSessions-t használó minden további rész már ezt kapja
const allSessions = sessionsOfAllWeeks.filter((s) => {
  const t = s.week_typef
  return !t || t === 'every' || t === viewParity
})

  // csak a kiválasztott hétre eső órák (importált függvény nélkül, hogy semmi ne írhassa felül)
  const visibleSessions = allSessions.filter((s) => {
    const t = s.week_type
    if (t === 'even') return viewParity === 'even'
    if (t === 'odd') return viewParity === 'odd'
    return true // 'every', üres vagy ismeretlen érték
  })
  // a barátod óráit nem lehet szerkeszteni (a Home-on az isMine nincs megadva, ott minden a tiéd)
  const canEditSelected = selectedSession ? selectedSession.isMine !== false : false

  const startEditing = () => {
    const course = courses.find((c) => c.id === selectedSession.courseId)
    if (!course) return
    setEditing({ course, sessionId: selectedSession.id })
    setSelectedSession(null)
  }

  const totalMinutes = (END_HOUR - START_HOUR) * 60
  const hourCount = END_HOUR - START_HOUR
  const isDayView = viewMode === 'day'
  const daysToShow = isDayView ? DAYS.filter((d) => d.value === selectedDay) : DAYS

  const nowTop = ((nowMinutes - START_HOUR * 60) / totalMinutes) * 100
  const showNow = nowTop >= 0 && nowTop <= 100
  // a piros vonal csak akkor jelenik meg, ha a mostani hetet nézzük
  const todayIsVisible = daysToShow.some((d) => d.value === todayValue) && viewParity === currentParity

  // az üzenet a saját napodról szól, ezért a közös nézetben nem jelenik meg
  const dayMessage = isDuo
    ? null
    : getDayMessage({
        sessions: visibleSessions.filter((s) => s.day_of_week === selectedDay && s.isMine !== false), 
        dayValue: selectedDay,
        isToday: selectedDay === todayValue,
      })

  const getBlockBackground = (session) => {
    if (isDuo) return toGradient(session.isMine === false ? duoColors.friend : duoColors.mine)
    return session.color || '#3b82f6'
  }

  const columns = `var(--time-col) repeat(${daysToShow.length}, minmax(0, 1fr))`

  return (
    <div className="timetable">
      <div className="timetable-controls">
        <div className="view-toggle">
          <span
            className="view-indicator"
            style={{ transform: `translateX(${isDayView ? 100 : 0}%)` }}
          />
          <button
            type="button"
            className={!isDayView ? 'active' : ''}
            aria-pressed={!isDayView}
            onClick={() => setViewMode('week')}
          >
            Heti nézet
          </button>
          <button
            type="button"
            className={isDayView ? 'active' : ''}
            aria-pressed={isDayView}
            onClick={() => setViewMode('day')}
          >
            Napi nézet
          </button>
        </div>

        {/* egyetlen gomb: kattintásra a szövege cserélődik páros és páratlan hét között */}
        <button
        type="button"
        className={`parity-btn ${viewParity !== currentParity ? 'is-other' : ''}`}
        onClick={() => setViewParity((p) => (p === 'even' ? 'odd' : 'even'))}
        title={viewParity === currentParity ? 'Ez az aktuális hét' : 'Nem az aktuális hetet nézed'}
        >
        <span key={viewParity} className="parity-text">{PARITY_LABEL[viewParity]}</span>
        {viewParity === currentParity && <span className="parity-dot" aria-label="ez a hét" />}
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
        const clusters = groupOverlapping(visibleSessions.filter((s) => s.day_of_week === day.value))
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
            </div>
          )
        })}

        {showNow && todayIsVisible && (
          <div className="now-line-full" style={{ top: `${nowTop}%` }} />
        )}
      </div>

      <CourseModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        canEdit={canEditSelected}
        onEdit={startEditing}
      />

      <CourseFormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={() => onChanged?.()}
        editingCourse={editing?.course ?? null}
        editingSessionId={editing?.sessionId}
      />
    </div>
  )
}