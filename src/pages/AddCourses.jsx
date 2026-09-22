import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DAYS = [
  { value: 1, label: 'Hétfő' },
  { value: 2, label: 'Kedd' },
  { value: 3, label: 'Szerda' },
  { value: 4, label: 'Csütörtök' },
  { value: 5, label: 'Péntek' },
]

export const AddCourse = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [instructor, setInstructor] = useState('')
  const [color, setColor] = useState('#3b82f6')

  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:30')
  const [type, setType] = useState('lecture')
  const [room, setRoom] = useState('')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // segédfüggvény: "HH:MM" -> percek száma
  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const checkOverlap = async () => {
    // lekérjük a user összes session-jét, amiknek a kurzusa hozzá tartozik
    const { data, error } = await supabase
      .from('sessions')
      .select('id, day_of_week, start_time, end_time, courses!inner(user_id, name)')
      .eq('courses.user_id', user.id)
      .eq('day_of_week', dayOfWeek)

    if (error) {
      // ha az ellenőrzés hibázik, ne blokkoljuk a mentést, csak logoljuk
      console.error('Overlap check error:', error)
      return null
    }

    const newStart = timeToMinutes(startTime)
    const newEnd = timeToMinutes(endTime)

    const conflict = data.find((s) => {
      const existingStart = timeToMinutes(s.start_time)
      const existingEnd = timeToMinutes(s.end_time)
      return newStart < existingEnd && existingStart < newEnd
    })

    return conflict || null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (endTime <= startTime) {
      setError('A befejezés időpontjának a kezdés után kell lennie.')
      return
    }

    setLoading(true)

    const conflict = await checkOverlap()
    if (conflict) {
      const proceed = window.confirm(
        `Ez az időpont ütközik ezzel: "${conflict.courses.name}" (${conflict.start_time.slice(0,5)}–${conflict.end_time.slice(0,5)}). Mégis felveszed?`
      )
      if (!proceed) {
        setLoading(false)
        return
      }
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({ user_id: user.id, name, code, instructor, color })
      .select()
      .single()

    if (courseError) {
      setError(courseError.message)
      setLoading(false)
      return
    }

    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        course_id: course.id,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        type,
        room,
      })

    setLoading(false)

    if (sessionError) {
      setError(sessionError.message)
      return
    }

    navigate('/')
  }

  return (
    <div>
      <h1>Új kurzus hozzáadása</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Kurzus neve</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label>Kód</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} />
        </div>

        <div>
          <label>Oktató</label>
          <input value={instructor} onChange={(e) => setInstructor(e.target.value)} />
        </div>

        <div>
          <label>Szín</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>

        <hr />

        <div>
          <label>Nap</label>
          <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Kezdés</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>

        <div>
          <label>Vége</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>

        <div>
          <label>Típus</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="lecture">Előadás</option>
            <option value="practice">Gyakorlat</option>
            <option value="lab">Labor</option>
          </select>
        </div>

        <div>
          <label>Terem</label>
          <input value={room} onChange={(e) => setRoom(e.target.value)} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Mentés...' : 'Mentés'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}