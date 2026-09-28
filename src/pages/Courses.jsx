import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { CourseFormModal } from '../components/CourseFormModal'
import { showSuccess, showError } from '../toast'
import './Courses.css'

const DAYS_SHORT = { 1: 'Hé', 2: 'Ke', 3: 'Sze', 4: 'Cs', 5: 'Pé' }
const TYPE_HU = { lecture: 'Előadás', practice: 'Gyakorlat', lab: 'Labor' }

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const PencilIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
  </svg>
)

const sortSessions = (sessions = []) =>
  [...sessions].sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))

export const Courses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, name, code, color, instructor, location,
        sessions ( id, day_of_week, start_time, end_time, type, room )
      `)
      .eq('user_id', user.id)
      .order('name')

    if (error) showError('Nem sikerült betölteni a kurzusokat.')
    else setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchCourses()
  }, [user])

  const openNew = () => {
    setEditingCourse(null)
    setModalOpen(true)
  }

  const openEdit = (course) => {
    setEditingCourse(course)
    setModalOpen(true)
  }

  const handleDelete = async (courseId) => {
    const { error } = await supabase.from('courses').delete().eq('id', courseId)
    setConfirmingId(null)

    if (error) {
      showError('Hiba: ' + error.message)
      return
    }
    setCourses((prev) => prev.filter((c) => c.id !== courseId))
    showSuccess('Kurzus törölve!')
  }

  return (
    <div className="courses-page">
      <div className="page-head">
        <div>
          <h1>Kurzusaim</h1>
          {!loading && courses.length > 0 && <p>{courses.length} kurzus</p>}
        </div>
        <button className="btn btn-primary btn-with-icon" onClick={openNew}>
          <PlusIcon />
          Új kurzus
        </button>
      </div>

      {loading ? (
        <p className="page-status">Betöltés…</p>
      ) : courses.length === 0 ? (
        <div className="glass-card empty-state">
          <h2>Még nincs kurzusod</h2>
          <p>Vedd fel az első kurzusodat, és megjelenik az órarendedben.</p>
          <button className="btn btn-primary" onClick={openNew}>Első kurzus felvétele</button>
        </div>
      ) : (
        <div className="course-list">
          {courses.map((course) => {
            const sessions = sortSessions(course.sessions)
            const confirming = confirmingId === course.id

            return (
              <article key={course.id} className="glass-card course-card">
                <span className="course-swatch" style={{ background: course.color || '#0a84ff' }} />

                <div className="course-main">
                  <div className="course-title-row">
                    <h3>{course.name}</h3>
                    {course.code && <span className="course-code">{course.code}</span>}
                  </div>
                  {course.instructor && <p className="course-meta">{course.instructor}</p>}

                  {sessions.length === 0 ? (
                    <p className="course-meta">Még nincs időpont felvéve.</p>
                  ) : (
                    <ul className="session-chips">
                      {sessions.map((s) => (
                        <li key={s.id} className="session-chip">
                          <strong>
                            {DAYS_SHORT[s.day_of_week]} {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                          </strong>
                          {s.type && <span>{TYPE_HU[s.type] || s.type}</span>}
                          {s.room && <span>{s.room}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="course-actions">
                  {confirming ? (
                    <>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course.id)}>
                        Törlés
                      </button>
                      <button className="btn btn-sm" onClick={() => setConfirmingId(null)}>
                        Mégse
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="icon-btn" onClick={() => openEdit(course)} aria-label={`${course.name} szerkesztése`}>
                        <PencilIcon />
                      </button>
                      <button className="icon-btn danger" onClick={() => setConfirmingId(course.id)} aria-label={`${course.name} törlése`}>
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <CourseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchCourses}
        editingCourse={editingCourse}
      />
    </div>
  )
}