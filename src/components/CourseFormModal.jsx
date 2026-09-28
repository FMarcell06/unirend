import { useEffect, useState } from 'react'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import './GlassModal.css'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { showSuccess, showError } from '../toast'

const DAYS = [
  { value: 1, short: 'Hé' },
  { value: 2, short: 'Ke' },
  { value: 3, short: 'Sze' },
  { value: 4, short: 'Cs' },
  { value: 5, short: 'Pé' },
]

const TYPES = [
  { value: 'lecture', label: 'Előadás' },
  { value: 'practice', label: 'Gyakorlat' },
  { value: 'lab', label: 'Labor' },
]

const COLORS = ['#0a84ff', '#8b5cf6', '#ff375f', '#ff9f0a', '#30d158', '#64d2ff', '#ff6482', '#ac8e68']

const emptyForm = {
  name: '', code: '', instructor: '', color: COLORS[0],
  dayOfWeek: 1, startTime: '08:00', endTime: '09:30', type: 'lecture', room: '',
}

export const CourseFormModal = ({ open, onClose, onSaved, editingCourse }) => {
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(editingCourse)
  const isCustomColor = !COLORS.includes(form.color.toLowerCase())

  useEffect(() => {
    if (!open) return

    if (editingCourse) {
      const session = editingCourse.sessions?.[0] || {}
      setForm({
        name: editingCourse.name || '',
        code: editingCourse.code || '',
        instructor: editingCourse.instructor || '',
        color: editingCourse.color || COLORS[0],
        dayOfWeek: session.day_of_week || 1,
        startTime: session.start_time?.slice(0, 5) || '08:00',
        endTime: session.end_time?.slice(0, 5) || '09:30',
        type: session.type || 'lecture',
        room: session.room || '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [editingCourse, open])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.endTime <= form.startTime) {
      showError('A befejezésnek a kezdés után kell lennie.')
      return
    }

    setLoading(true)

    const coursePayload = {
      name: form.name.trim(),
      code: form.code.trim(),
      instructor: form.instructor.trim(),
      color: form.color,
    }

    const sessionPayload = {
      day_of_week: form.dayOfWeek,
      start_time: form.startTime,
      end_time: form.endTime,
      type: form.type,
      room: form.room.trim(),
    }

    if (isEditing) {
      const { error: courseError } = await supabase
        .from('courses')
        .update(coursePayload)
        .eq('id', editingCourse.id)

      if (courseError) {
        showError(courseError.message)
        setLoading(false)
        return
      }

      const existingSessionId = editingCourse.sessions?.[0]?.id
      const sessionResult = existingSessionId
        ? await supabase.from('sessions').update(sessionPayload).eq('id', existingSessionId)
        : await supabase.from('sessions').insert({ ...sessionPayload, course_id: editingCourse.id })

      if (sessionResult.error) {
        showError(sessionResult.error.message)
        setLoading(false)
        return
      }
    } else {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({ ...coursePayload, user_id: user.id })
        .select()
        .single()

      if (courseError) {
        showError(courseError.message)
        setLoading(false)
        return
      }

      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({ ...sessionPayload, course_id: course.id })

      if (sessionError) {
        // ne maradjon időpont nélküli, árva kurzus
        await supabase.from('courses').delete().eq('id', course.id)
        showError(sessionError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    showSuccess(isEditing ? 'Kurzus frissítve!' : 'Kurzus hozzáadva!')
    onSaved()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      center
      classNames={{ overlay: 'glass-overlay', modal: 'glass-modal' }}
    >
      <h2 className="modal-title">{isEditing ? 'Kurzus szerkesztése' : 'Új kurzus'}</h2>

      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="course-name">Kurzus neve</label>
          <input id="course-name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="course-code">Kód</label>
            <input id="course-code" value={form.code} onChange={(e) => update('code', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="course-instructor">Oktató</label>
            <input id="course-instructor" value={form.instructor} onChange={(e) => update('instructor', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Szín</label>
          <div className="color-row">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-dot ${form.color.toLowerCase() === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => update('color', c)}
                aria-label={`Szín: ${c}`}
              />
            ))}
            <label
              className={`color-dot color-custom ${isCustomColor ? 'active' : ''}`}
              style={isCustomColor ? { background: form.color } : undefined}
              aria-label="Egyéni szín"
            >
              <input type="color" value={form.color} onChange={(e) => update('color', e.target.value)} />
            </label>
          </div>
        </div>

        <div className="form-divider" />

        <div className="field">
          <label>Nap</label>
          <div className="segmented segmented-fill" role="group" aria-label="Nap">
            {DAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                className={form.dayOfWeek === d.value ? 'active' : ''}
                onClick={() => update('dayOfWeek', d.value)}
              >
                {d.short}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="course-start">Kezdés</label>
            <input id="course-start" type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="course-end">Vége</label>
            <input id="course-end" type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} required />
          </div>
        </div>

        <div className="field">
          <label>Típus</label>
          <div className="segmented segmented-fill" role="group" aria-label="Típus">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={form.type === t.value ? 'active' : ''}
                onClick={() => update('type', t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="course-room">Terem</label>
          <input id="course-room" value={form.room} onChange={(e) => update('room', e.target.value)} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Mégse</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Mentés…' : 'Mentés'}
          </button>
        </div>
      </form>
    </Modal>
  )
}