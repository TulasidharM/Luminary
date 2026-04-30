import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Entry from './pages/Entry';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/entry" 
        element={
          <ProtectedRoute>
            <Entry />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/entry/:id" 
        element={
          <ProtectedRoute>
            <Entry />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
