import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false); // Renamed to avoid conflict
  
  // Destructure 'loading' from context to prevent form flash
  const { login, isAuthenticated, loading } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect once authentication check is FINISHED
    if (!loading && isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'ARTIST') navigate('/artist');
      else if (user?.role === 'BUYER') navigate('/buyer');
      else navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  // If AuthContext is still checking the token, show a blank screen or spinner
  if (loading) return null; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const result = await login(email, password);
    setFormLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      // Navigation is handled by the useEffect above
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-dark-card rounded-2xl shadow-2xl p-8 border border-gray-800">
        <h2 className="text-3xl font-bold text-gold mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8">Sign in to your ArtEvo account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg focus:outline-none focus:border-gold text-white"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg focus:outline-none focus:border-gold text-white"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-gold hover:text-gold-light transition">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-3 bg-gold hover:bg-gold-light text-dark-bg font-semibold rounded-lg transition disabled:opacity-50"
          >
            {formLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold hover:text-gold-light">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;