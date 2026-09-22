import { Timetable } from '../components/TimeTable'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export const Home = () => {
  const { signOut, user } = useAuth()

  return (
    <div>
      <p>Bejelentkezve: {user?.email}</p>
      <button onClick={signOut}>Kijelentkezés</button>
      <Link to="/add-course">+ Új kurzus</Link> 
      <Timetable/>
    </div>
  )
}