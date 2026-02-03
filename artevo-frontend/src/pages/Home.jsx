import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="text-gold">ArtEvo</span>
            <span className="text-white"> - Where Art Meets</span>
            <br />
            <span className="text-gold">Evolution</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Discover extraordinary artworks, bid on exclusive auctions, and connect with talented artists from around the world.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/gallery"
              className="px-8 py-4 bg-gold hover:bg-gold-light text-dark-bg font-semibold rounded-lg transition text-lg"
            >
              Explore Gallery
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="px-8 py-4 border-2 border-gold text-gold hover:bg-gold hover:text-dark-bg font-semibold rounded-lg transition text-lg"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-dark-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gold">Why ArtEvo?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-dark-bg p-8 rounded-xl border border-gray-800">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2 text-gold">Premium Gallery</h3>
              <p className="text-gray-400">
                Browse curated collections of stunning artworks from verified artists worldwide.
              </p>
            </div>
            <div className="bg-dark-bg p-8 rounded-xl border border-gray-800">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-gold">Live Auctions</h3>
              <p className="text-gray-400">
                Participate in exclusive auctions and bid on rare, one-of-a-kind pieces.
              </p>
            </div>
            <div className="bg-dark-bg p-8 rounded-xl border border-gray-800">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2 text-gold">Secure Transactions</h3>
              <p className="text-gray-400">
                Safe and secure wallet system for seamless art purchases and sales.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
