import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import CallPage from './webrtc'
import CreateMeet from './CreateMeet'
import MeetPage from './webrtc'
import {BrowserRouter,Routes,Route} from "react-router-dom"
function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateMeet />} />
        <Route path="/meet/:roomId" element={<MeetPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
