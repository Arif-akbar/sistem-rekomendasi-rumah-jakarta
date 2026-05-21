import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import PropertyDetail from './pages/PropertyDetail';
import ComparePage from './pages/ComparePage';
import CompareBar from './components/CompareBar';
import { AdminRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import PropertyForm from './pages/PropertyForm';
import WishlistPage from './pages/WishlistPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen bg-[#030712]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            {/* Alias /auth → /login agar redirect lama tidak 404 */}
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/properti/:id" element={<PropertyDetail />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            {/* Admin routes — diproteksi AdminRoute */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/tambah" element={<AdminRoute><PropertyForm /></AdminRoute>} />
            <Route path="/admin/edit/:id" element={<AdminRoute><PropertyForm /></AdminRoute>} />
          </Routes>
          <CompareBar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;