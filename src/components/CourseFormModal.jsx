import { useState, useEffect } from 'react'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const DAYS = [
  { value: 1, label: 'Hétfő' },
  { value: 2, label: 'Kedd' },
  { value: 3, label: 'Szerda' },
  { value: 4, label: 'Csütörtök' },
  { value: 5, label: 'Péntek' },
]

const emptyForm = {
  name: '', code: '', instructor: '', color: '#3b82f6',
  dayOfWeek: 1, startTime: '08:00', endTime: '09:30', type: 'lecture', room: '',
}

export const CourseFormModal = ({ open, onClose, onSaved, editingCourse }) => {
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = Boolean(editingCourse)

  useEffect(() => {
    if (editingCourse) {
      const session = editingCourse.sessions?.[0] || {}
      setForm({
        name: editingCourse.name || '',
        code: editingCourse.code || '',
        instructor: editingCourse.instructor || '',
        color: editingCourse.color || '#3b82f6',
        dayOfWeek: session.day_of_week || 1,
        startTime: session.start_time?.slice(0, 5) || '08:00',
        endTime: session.end_time?.slice(0, 5) || '09:30',
        type: session.type || 'lecture',
        room: session.room || '',
      })
    } else {
      setForm(emptyForm)
    }
    setError(null)
  }, [editingCourse, open])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.endTime <= form.startTime) {
      setError('A befejezés a kezdés után kell legyen.')
      return
    }

    setLoading(true)

    if (isEditing) {
      // kurzus adatok frissítése
      const { error: courseError } = await supabase
        .from('courses')
        .update({
          name: form.name, code: form.code, instructor: form.instructor, color: form.color,
        })
        .eq('id', editingCourse.id)

      if (courseError) {
        setError(courseError.message)
        setLoading(false)
        return
      }

      // session frissítése (ha van már session-je), vagy létrehozás, ha nincs
      const existingSessionId = editingCourse.sessions?.[0]?.id

      const sessionPayload = {
        day_of_week: form.dayOfWeek,
        start_time: form.startTime,
        end_time: form.endTime,
        type: form.type,
        room: form.room,
      }

      const sessionResult = existingSessionId
        ? await supabase.from('sessions').update(sessionPayload).eq('id', existingSessionId)
        : await supabase.from('sessions').insert({ ...sessionPayload, course_id: editingCourse.id })

      if (sessionResult.error) {
        setError(sessionResult.error.message)
        setLoading(false)
        return
      }
    } else {
      // új kurzus létrehozása
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          user_id: user.id, name: form.name, code: form.code,
          instructor: form.instructor, color: form.color,
        })
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
          course_id: course.id, day_of_week: form.dayOfWeek,
          start_time: form.startTime, end_time: form.endTime,
          type: form.type, room: form.room,
        })

      if (sessionError) {
        setError(sessionError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} center>
      <div style={{ minWidth: 320, padding: '8px' }}>
        <h2>{isEditing ? 'Kurzus szerkesztése' : 'Új kurzus'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Kurzus neve</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div>
            <label>Kód</label>
            <input value={form.code} onChange={(e) => update('code', e.target.value)} />
          </div>
          <div>
            <label>Oktató</label>
            <input value={form.instructor} onChange={(e) => update('instructor', e.target.value)} />
          </div>
          <div>
            <label>Szín</label>
            <input type="color" value={form.color} onChange={(e) => update('color', e.target.value)} />
          </div>

          <hr />

          <div>
            <label>Nap</label>
            <select value={form.dayOfWeek} onChange={(e) => update('dayOfWeek', Number(e.target.value))}>
              {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label>Kezdés</label>
            <input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} required />
          </div>
          <div>
            <label>Vége</label>
            <input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} required />
          </div>
          <div>
            <label>Típus</label>
            <select value={form.type} onChange={(e) => update('type', e.target.value)}>
              <option value="lecture">Előadás</option>
              <option value="practice">Gyakorlat</option>
              <option value="lab">Labor</option>
            </select>
          </div>
          <div>
            <label>Terem</label>
            <input value={form.room} onChange={(e) => update('room', e.target.value)} />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Mentés...' : 'Mentés'}
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </Modal>
  )
}