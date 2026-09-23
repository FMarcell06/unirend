import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import './App.css'
import { AddCourse } from './pages/AddCourses'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/'element={<ProtectedRoute><Home /></ProtectedRoute>}/>
        <Route path='/add-course'element={<ProtectedRoute><AddCourse /></ProtectedRoute>}/>
      </Routes>
    </AuthProvider>
  )
}

export default App