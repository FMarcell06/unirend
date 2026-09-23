import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TimeTable } from '../components/TimeTable'
import { CourseList } from '../components/CourseList'

export const Home = () => {
  const { user, signOut } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  useEffect(() => {
    if (user) fetchCourses()
  }, [user])

  const handleCourseDeleted = (deletedId) => {
    setCourses((prev) => prev.filter((c) => c.id !== deletedId))
  }

  return (
    <div>
      <p>Bejelentkezve: {user?.email}</p>
      <button onClick={signOut}>Kijelentkezés</button>
      <Link to="/add-course">+ Új kurzus</Link>

      {loading && <p>Betöltés...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <TimeTable courses={courses} />
          <CourseList courses={courses} onCourseDeleted={handleCourseDeleted} />
        </>
      )}
    </div>
  )
}