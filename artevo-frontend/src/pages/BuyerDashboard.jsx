import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/apiError';

const BuyerDashboard = () => {
  const { user, updateUser } = useAuth();
  
  // --- States ---
  const [activeTab, setActiveTab] = useState('gallery');
  
  // Data States
  const [galleryArts, setGalleryArts] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  
  // Auction Interaction State
  const [bidAmount, setBidAmount] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);

  // ----------------------------------------------------
  // 1. Data Fetching
  // ----------------------------------------------------

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/art/gallery'); 
      setGalleryArts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Gallery fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/auctions');
      setActiveAuctions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Auctions fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // UPDATED: Fetch My Purchases
  const fetchMyPurchases = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Ensure this endpoint exists in your backend!
      const response = await axiosInstance.get('/art/my-artworks');
      
      console.log("My Purchases Data:", response.data); // DEBUGGING: Check Console F12
      
      setMyPurchases(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Purchases fetch failed", error);
      // Don't show toast on 404 to avoid spamming user if endpoint is missing temporarily
      if (error.response && error.response.status !== 404) {
          toast.error("Could not load your purchase history.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'gallery') fetchGallery();
    if (activeTab === 'auctions') fetchAuctions();
    if (activeTab === 'purchases') fetchMyPurchases();
  }, [activeTab, fetchGallery, fetchAuctions, fetchMyPurchases]);

  // ----------------------------------------------------
  // 2. Action Handlers (Kept same as before)
  // ----------------------------------------------------

  const handleBuyArt = async (artId, price) => {
    if (user.walletBalance < price) {
      toast.error(`Insufficient funds. You need $${(price - user.walletBalance).toFixed(2)} more.`);
      setShowAddMoneyModal(true);
      return;
    }

    if (!window.confirm(`Confirm purchase for $${price}?`)) return;

    try {
      setLoading(true);
      await axiosInstance.post(`/art/buy/${artId}`); 
      toast.success('Purchase successful! Item added to your collection.');
      updateUser({ ...user, walletBalance: user.walletBalance - price });
      // If we are in gallery, refresh gallery. If logic changes later, we might redirect to purchases.
      fetchGallery(); 
    } catch (error) {
      toast.error(getErrorMessage(error, 'Purchase failed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    
    if (!selectedAuction) return;
    if (amount <= selectedAuction.currentHighestBid) {
      toast.error(`Bid must be higher than $${selectedAuction.currentHighestBid}`);
      return;
    }
    if (user.walletBalance < amount) {
      toast.error("Insufficient wallet balance for this bid.");
      setShowAddMoneyModal(true);
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(`/auctions/${selectedAuction.id}/bid`, null, {
        params: { amount }
      });
      
      toast.success('Bid placed successfully!');
      setShowBidModal(false);
      setBidAmount('');
      fetchAuctions(); 
    } catch (error) {
      toast.error(getErrorMessage(error, 'Bid failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const amount = parseFloat(addMoneyAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/users/${user.id}/add-money`, null, {
        params: { amount },
      });
      updateUser(response.data); 
      toast.success('Funds added!');
      setShowAddMoneyModal(false);
      setAddMoneyAmount('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add money'));
    } finally {
      setLoading(false);
    }
  };

  const openBidModal = (auction) => {
    setSelectedAuction(auction);
    setBidAmount(auction.currentHighestBid + 10); 
    setShowBidModal(true);
  };

  // ----------------------------------------------------
  // 3. Render
  // ----------------------------------------------------
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Buyer Dashboard</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-gray-400">Browse art, bid on auctions, and manage purchases</p>
            <div className="flex items-center gap-4">
              <div className="bg-dark-card px-4 py-2 rounded border border-gray-700">
                <span className="text-gray-300">
                  Wallet: <span className="text-gold font-bold ml-2">${user?.walletBalance ? user.walletBalance.toFixed(2) : '0.00'}</span>
                </span>
              </div>
              <button 
                onClick={() => setShowAddMoneyModal(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition"
              >
                + Add Money
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button 
            onClick={() => setActiveTab('auctions')} 
            className={`px-6 py-3 font-semibold transition ${activeTab === 'auctions' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            Live Auctions
          </button>
          <button 
            onClick={() => setActiveTab('purchases')} 
            className={`px-6 py-3 font-semibold transition ${activeTab === 'purchases' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            My Purchases
          </button>
        </div>

        {/* ---------------- TAB: LIVE AUCTIONS ---------------- */}
        {activeTab === 'auctions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAuctions.map((auction) => (
              <div key={auction.id} className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 hover:border-gold transition duration-300 shadow-lg relative">
                 <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                   LIVE
                 </div>
                 <div className="h-64 bg-gray-900">
                    <img src={auction.art?.imageUrl} alt="art" className="w-full h-full object-cover" />
                 </div>
                 <div className="p-6">
                    <h3 className="text-xl font-bold text-white truncate">{auction.art?.title}</h3>
                    <div className="mt-4 flex justify-between items-end">
                       <div>
                          <p className="text-xs text-gray-400">Current Bid</p>
                          <p className="text-gold font-bold text-2xl">${auction.currentHighestBid}</p>
                       </div>
                       <button 
                         onClick={() => openBidModal(auction)}
                         className="px-6 py-2 bg-gold text-dark-bg font-bold rounded hover:bg-yellow-600 transition"
                       >
                         Place Bid
                       </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                       Ends: {new Date(auction.endTime).toLocaleString()}
                    </p>
                 </div>
              </div>
            ))}
            {activeAuctions.length === 0 && !loading && (
              <p className="text-gray-500 col-span-full text-center py-10">No active auctions at the moment.</p>
            )}
          </div>
        )}

        {/* ---------------- TAB: MY PURCHASES (UPDATED) ---------------- */}
        {activeTab === 'purchases' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {/* FIX: Removed .filter(art => art.status === 'SOLD') 
                  Now it shows ALL items returned by the API. 
               */}
               {myPurchases.map((art) => (
                 <div key={art.id} className="bg-dark-card rounded-xl overflow-hidden border border-green-900 hover:border-green-500 transition duration-300 shadow-md opacity-90">
                    <div className="h-64 bg-gray-900 relative">
                       <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-green-900 bg-opacity-20 flex items-center justify-center">
                          <span className="bg-green-600 text-white px-4 py-1 rounded-full font-bold shadow-lg transform -rotate-12 border-2 border-white">
                            OWNED
                          </span>
                       </div>
                    </div>
                    <div className="p-6">
                       <h3 className="text-xl font-bold text-white truncate">{art.title}</h3>
                       <p className="text-gray-400 text-sm mt-1 line-clamp-2">{art.description}</p>
                       <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Value</span>
                          <span className="text-green-400 font-bold text-lg">${art.price.toFixed(2)}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            {myPurchases.length === 0 && !loading && (
               <div className="text-center py-20 bg-dark-card rounded border border-gray-800">
                 <p className="text-gray-400 text-lg">You haven't purchased any art yet.</p>
                 <button onClick={() => setActiveTab('auctions')} className="mt-4 text-gold hover:underline">Go to Auctions</button>
               </div>
            )}
          </div>
        )}

        {/* ---------------- MODALS (Kept same as before) ---------------- */}

        {/* Bid Modal */}
        {showBidModal && selectedAuction && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-dark-card rounded-xl p-8 max-w-sm w-full border border-gold shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-white">Place a Bid</h2>
                <p className="text-gray-400 mb-4 text-sm">Current Highest: <span className="text-gold font-bold">${selectedAuction.currentHighestBid}</span></p>
                <form onSubmit={handlePlaceBid}>
                   <input 
                      type="number" 
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white mb-4 focus:border-gold outline-none"
                      placeholder="Enter amount..."
                   />
                   <div className="flex gap-3">
                      <button type="submit" disabled={loading} className="flex-1 bg-gold text-dark-bg py-2 rounded font-bold hover:bg-yellow-600 transition">Confirm</button>
                      <button type="button" onClick={() => setShowBidModal(false)} className="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-600 transition">Cancel</button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {/* Add Money Modal */}
        {showAddMoneyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-dark-card rounded-xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-gold">Add Funds</h2>
              <form onSubmit={handleAddMoney} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount ($)</label>
                  <input type="number" step="0.01" min="1" value={addMoneyAmount} onChange={(e) => setAddMoneyAmount(e.target.value)} required className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg focus:border-gold text-white outline-none" />
                </div>
                <div className="flex gap-4">
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-gold hover:bg-yellow-600 text-dark-bg font-bold rounded-lg transition">{loading ? 'Processing...' : 'Confirm'}</button>
                  <button type="button" onClick={() => setShowAddMoneyModal(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BuyerDashboard;