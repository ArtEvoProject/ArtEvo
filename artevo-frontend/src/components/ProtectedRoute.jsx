import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gold text-xl">Loading session...</div>
      </div>
    );
  }

  // 🔍 DEBUGGING: Check your browser console (F12) to see these values
  console.log(`[ProtectedRoute] Checking access for: ${location.pathname}`);
  console.log(` - User Authenticated: ${isAuthenticated}`);
  console.log(` - User Role: '${user?.role}'`);
  console.log(` - Required Role: '${requiredRole}'`);

  if (!isAuthenticated) {
    console.warn(" -> Access Denied: Not authenticated");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Fix: Check role, but ensure we handle potential undefined values safely
  if (requiredRole && user?.role !== requiredRole) {
    console.warn(` -> Access Denied: Role mismatch. Expected '${requiredRole}' but got '${user?.role}'`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;