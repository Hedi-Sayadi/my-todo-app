import { BrowserRouter, Navigate, Outlet, Routes, Route, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Categories from './pages/Categories'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import { getActiveSession } from './services/authService'

function PublicRoute() {
	const session = getActiveSession()

	if (session) {
		return <Navigate to="/" replace />
	}

	return <Outlet />
}

function ProtectedRoute() {
	const session = getActiveSession()
	const location = useLocation()

	if (!session) {
		return <Navigate to="/login" replace state={{ from: location }} />
	}

	return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App