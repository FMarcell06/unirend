import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TimeTable } from '../components/TimeTable'

export const Home = () => {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`id, name, code, color, instructor, sessions ( id, day_of_week, start_time, end_time, type, room )`)
        .eq('user_id', user.id)

      if (!error) setCourses(data)
      setLoading(false)
    }

    if (user) fetchCourses()
  }, [user])

  return (
    <div className="home-page">
      <div className="home-greeting">
        <h1>Szia, {profile?.display_name?.split(' ')[0] || 'ott'}! 👋</h1>
      </div>

      {loading ? <p style={{ textAlign: 'center' }}>Betöltés...</p> : <TimeTable courses={courses} />}
    </div>
  )
}