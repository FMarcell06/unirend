import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
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

export const Timetable = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return

    const fetchCourses = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, name, code, color, instructor, location,
          sessions ( id, day_of_week, start_time, end_time, type, room )
        `)
        .eq('user_id', user.id)

      if (error) {
        setError(error.message)
      } else {
        setCourses(data)
      }
      setLoading(false)
    }

    fetchCourses()
  }, [user])

  if (loading) return <p>Betöltés...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  // laposra hozzuk: minden session-t kiemelünk a hozzá tartozó kurzus adataival együtt
  const allSessions = courses.flatMap((course) =>
    (course.sessions || []).map((session) => ({
      ...session,
      courseName: course.name,
      courseCode: course.code,
      color: course.color,
    }))
  )

  // időpozíció kiszámítása a griden belül (perc alapon, START_HOUR-tól)
  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const totalMinutes = (END_HOUR - START_HOUR) * 60

  return (
    <div className="timetable">
      <div className="timetable-header">
        <div className="time-col-header"></div>
        {DAYS.map((day) => (
          <div key={day.value} className="day-header">{day.label}</div>
        ))}
      </div>

      <div className="timetable-body">
        {/* óravonalak a bal oldalon */}
        <div className="time-col">
          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
            <div key={i} className="time-label">
              {String(START_HOUR + i).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* napi oszlopok */}
        {DAYS.map((day) => (
          <div key={day.value} className="day-col">
            {allSessions
              .filter((s) => s.day_of_week === day.value)
              .map((session) => {
                const top = ((timeToMinutes(session.start_time) - START_HOUR * 60) / totalMinutes) * 100
                const height = ((timeToMinutes(session.end_time) - timeToMinutes(session.start_time)) / totalMinutes) * 100

                return (
                  <div
                    key={session.id}
                    className="session-block"
                    style={{
                      top: `${top}%`,
                      height: `${height}%`,
                      backgroundColor: session.color || '#3b82f6',
                    }}
                  >
                    <strong>{session.courseName}</strong>
                    <div>{session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}</div>
                    {session.room && <div>{session.room}</div>}
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    </div>
  )
}