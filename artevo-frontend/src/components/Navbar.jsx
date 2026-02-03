import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, isArtist, isBuyer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-dark-card border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gold">ArtEvo</span>
            <span className="text-sm text-gray-400">Gallery & Auctions</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/gallery" className="text-gray-300 hover:text-gold transition">
              Gallery
            </Link>

            {isAuthenticated ? (
              <>
                {isArtist && (
                  <Link
                    to="/artist"
                    className="text-gray-300 hover:text-gold transition"
                  >
                    Artist Dashboard
                  </Link>
                )}
                {isBuyer && (
                  <Link
                    to="/buyer"
                    className="text-gray-300 hover:text-gold transition"
                  >
                    Buyer Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm">
                    {user?.name || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-gold transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gold hover:bg-gold-light text-dark-bg rounded-lg font-semibold transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
