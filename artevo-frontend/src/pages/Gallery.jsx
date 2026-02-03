import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import ArtCard from '../components/ArtCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/apiError';

const Gallery = () => {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Destructure 'user' to access email for the mock order
  const { isBuyer, updateUser, user } = useAuth();

  // --- Data Fetching ---
  const fetchArts = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/art/gallery');
      setArts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load gallery'));
      setArts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArts();
  }, [fetchArts]);

  // --- MOCK Payment Handler ---
  const handleBuy = async (artId) => {
    // 1. Find the art details (Price) using the ID
    const selectedArt = arts.find(a => a.id === artId);
    if (!selectedArt) {
        toast.error("Artwork details not found.");
        return;
    }
    const price = selectedArt.price;

    try {
      // 2. Call Microservice Bridge to get a (Mock) Order ID
      // This confirms your Frontend -> Main Backend -> Microservice chain works!
      const orderResponse = await axiosInstance.post('/purchase/initiate', null, {
        params: { 
            amount: price,
            userEmail: user?.email 
        }
      });

      const orderId = orderResponse.data;
      
      // Safety check
      if (!orderId || orderId === "ERROR") {
          throw new Error("Failed to generate Order ID from Microservice");
      }

      console.log("Microservice returned Mock Order ID:", orderId);

      // 3. Simulate the Payment Step (Replacing Razorpay Popup)
      // Since we don't have real keys, we ask the user to "pretend" they paid.
      const confirmPayment = window.confirm(
        `[TEST MODE]\n\nSimulate payment of $${price} for "${selectedArt.title}"?\n\n(Click OK to Pay, Cancel to Decline)`
      );

      if (confirmPayment) {
        // 4. Payment "Success" - Call original Buy API to transfer ownership
        await axiosInstance.post(`/art/buy/${artId}`);
        toast.success('Mock Payment Successful! Art added to collection.');
        
        // Refresh Gallery List (Item should disappear or mark sold)
        fetchArts();
        
        // Refresh User Profile (Update Wallet Balance)
        const profileRes = await axiosInstance.get('/users/profile');
        updateUser(profileRes.data);
      } else {
        toast.info("Payment Cancelled.");
      }

    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Purchase initiation failed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold text-xl">Loading gallery...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gold">Art Gallery</h1>
        {arts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No artworks available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {arts.map((art) => (
              <ArtCard
                key={art.id}
                art={art}
                onBuy={handleBuy}
                showBuyButton={isBuyer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;