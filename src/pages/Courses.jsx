import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { CourseFormModal } from '../components/CourseFormModal'

export const Courses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const fetchCourses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, name, code, color, instructor, location,
        sessions ( id, day_of_week, start_time, end_time, type, room )
      `)
      .eq('user_id', user.id)
      .order('name')

    if (!error) setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchCourses()
  }, [user])

  const handleAddClick = () => {
    setEditingCourse(null)
    setModalOpen(true)
  }

  const handleEditClick = (course) => {
    setEditingCourse(course)
    setModalOpen(true)
  }

  const handleDelete = async (courseId) => {
    const confirmed = window.confirm('Biztosan törlöd ezt a kurzust?')
    if (!confirmed) return

    const { error } = await supabase.from('courses').delete().eq('id', courseId)
    if (error) {
      alert('Hiba: ' + error.message)
      return
    }
    setCourses((prev) => prev.filter((c) => c.id !== courseId))
  }

  const DAYS_HU = { 1: 'Hétfő', 2: 'Kedd', 3: 'Szerda', 4: 'Csütörtök', 5: 'Péntek' }
  const TYPE_HU = { lecture: 'Előadás', practice: 'Gyakorlat', lab: 'Labor' }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Kurzusaim</h1>
        <button onClick={handleAddClick}>+ Új kurzus</button>
      </div>

      {loading && <p>Betöltés...</p>}

      {!loading && courses.length === 0 && <p>Még nincs felvitt kurzusod.</p>}

      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        {courses.map((course) => {
          const session = course.sessions?.[0]
          return (
            <div
              key={course.id}
              style={{
                borderLeft: `6px solid ${course.color}`,
                padding: '12px 16px',
                background: '#fafafa',
                borderRadius: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{course.name} {course.code && `(${course.code})`}</h3>
                {course.instructor && <p style={{ margin: '4px 0' }}><strong>Oktató:</strong> {course.instructor}</p>}
                {session && (
                  <p style={{ margin: '4px 0' }}>
                    <strong>{DAYS_HU[session.day_of_week]}</strong>{' '}
                    {session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}
                    {session.room && ` · ${session.room}`}
                    {session.type && ` · ${TYPE_HU[session.type] || session.type}`}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEditClick(course)}>Szerkesztés</button>
                <button onClick={() => handleDelete(course.id)}>Törlés</button>
              </div>
            </div>
          )
        })}
      </div>

      <CourseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchCourses}
        editingCourse={editingCourse}
      />
    </div>
  )
}