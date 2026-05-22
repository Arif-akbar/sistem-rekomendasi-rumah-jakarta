import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import PropertyDetail from './pages/PropertyDetail';
import ComparePage from './pages/ComparePage';
import CompareBar from './components/CompareBar';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import PropertyForm from './pages/PropertyForm';
import WishlistPage from './pages/WishlistPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen" style={{ background: '#0c0a14' }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            {/* Alias /auth → /login agar redirect lama tidak 404 */}
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/properti/:id" element={<PropertyDetail />} />
            <Route path="/compare" element={<ComparePage />} />

            {/* Protected routes — harus login */}
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

            {/* Admin routes — harus login + role admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/tambah" element={<AdminRoute><PropertyForm /></AdminRoute>} />
            <Route path="/admin/edit/:id" element={<AdminRoute><PropertyForm /></AdminRoute>} />

            {/* Catch-all → redirect ke home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <CompareBar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;