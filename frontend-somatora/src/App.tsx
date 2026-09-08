import { Route, Routes } from 'react-router'
import './App.css'
import LoginPage from './pages/login'
import DashboardPage from './pages/dashboard'

function App() {

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default App
