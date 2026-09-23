import { supabase } from '../supabaseClient'

export const CourseList = ({ courses, onCourseDeleted }) => {
  const handleDelete = async (courseId) => {
    const confirmed = window.confirm('Biztosan törlöd ezt a kurzust? Az összes hozzá tartozó időpont is törlődik.')
    if (!confirmed) return

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      alert('Hiba történt: ' + error.message)
      return
    }

    onCourseDeleted(courseId)
  }

  if (courses.length === 0) return <p>Még nincs felvitt kurzusod.</p>

  return (
    <ul className="course-list">
      {courses.map((course) => (
        <li key={course.id} style={{ borderLeft: `4px solid ${course.color}`, paddingLeft: '8px', marginBottom: '8px' }}>
          <strong>{course.name}</strong> {course.code && `(${course.code})`}
          {course.instructor && <span> — {course.instructor}</span>}
          <button onClick={() => handleDelete(course.id)} style={{ marginLeft: '10px' }}>
            Törlés
          </button>
        </li>
      ))}
    </ul>
  )
}