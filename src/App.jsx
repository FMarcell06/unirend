import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
      </Routes>
    </div>
  )
}

export default App
