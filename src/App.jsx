import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import './App.css'
import { AddCourse } from './pages/AddCourses'
import { Profile } from './pages/Profile'
import { Header } from './components/Header'
import { Courses } from './pages/Courses'
import { Social } from './pages/Social'
import { CommonView } from './pages/CommonView'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Header />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/'element={<ProtectedRoute><Home /></ProtectedRoute>}/>
        <Route path='/add-course'element={<ProtectedRoute><AddCourse /></ProtectedRoute>}/>
        <Route path='/profile'element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path='/courses'element={<ProtectedRoute><Courses /></ProtectedRoute>}/>
        <Route path='/social'element={<ProtectedRoute><Social /></ProtectedRoute>}/>
        <Route path='/common'element={<ProtectedRoute><CommonView /></ProtectedRoute>}/>
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App