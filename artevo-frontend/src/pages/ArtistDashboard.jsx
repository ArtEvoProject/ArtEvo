import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/apiError';

const ArtistDashboard = () => {
  const { user, updateUser } = useAuth();
  
  // Premium Check
  const isPremiumUser = user?.isPremium || user?.premium || false;

  // --- States ---
  const [activeTab, setActiveTab] = useState('upload'); // Options: 'upload', 'myart', 'history'
  
  // Data
  const [myArts, setMyArts] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]); 
  const [myAuctions, setMyAuctions] = useState([]); // NEW: Stores Auction History
  const [artsLoading, setArtsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  
  // Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  // Forms
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [auctionForm, setAuctionForm] = useState({
    artId: '',
    startingPrice: '',
    endTime: '',
  });

  // ----------------------------------------------------
  // 1. Data Fetching
  // ----------------------------------------------------

  // Fetch items created by the artist (Portfolio)
  const fetchMyArts = useCallback(async () => {
    if (!user?.id) return;
    setArtsLoading(true);
    try {
      // Calls the endpoint that uses findByArtist (Portfolio)
      const response = await axiosInstance.get('/art/portfolio'); 
      setMyArts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
       // Fallback for safety if /portfolio isn't live yet, try legacy
       try {
         const response = await axiosInstance.get('/art/my-artworks');
         setMyArts(Array.isArray(response.data) ? response.data : []);
       } catch (e) {
         toast.error(getErrorMessage(error, 'Failed to load artworks'));
         setMyArts([]);
       }
    } finally {
      setArtsLoading(false);
    }
  }, [user?.id]);

  const fetchActiveAuctions = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/auctions');
      setActiveAuctions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load active auctions", error);
    }
  }, []);

  // NEW: Fetch Artist's Auction History (Active + Sold + Closed)
  const fetchMyAuctionHistory = useCallback(async () => {
    setArtsLoading(true);
    try {
      const response = await axiosInstance.get('/auctions/my-history');
      setMyAuctions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load auction history", error);
      toast.error("Could not load auction history");
    } finally {
      setArtsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'myart') {
      fetchMyArts();
      fetchActiveAuctions();
    }
    if (activeTab === 'history') {
      fetchMyAuctionHistory();
    }
  }, [activeTab, fetchMyArts, fetchActiveAuctions, fetchMyAuctionHistory]);

  // ----------------------------------------------------
  // 2. Action Handlers
  // ----------------------------------------------------

  const handleViewDetails = (art) => {
    // Try to find the auction in active list first, then history list
    let auction = activeAuctions.find(a => a.art.id === art.id) || myAuctions.find(a => a.art.id === art.id);
    
    if (auction) {
      setSelectedAuction(auction);
      setShowDetailsModal(true);
    } else {
      toast.info("Auction details not available or item is not on auction.");
    }
  };

  const handleCloseAuction = async (auctionId) => {
    if (!window.confirm("Are you sure you want to close this auction? The highest bidder will be declared the winner.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/auctions/${auctionId}/close`); 
      toast.success('Auction closed! Winner declared.');
      
      if (response.data) {
        setSelectedAuction(response.data);
      }
      
      // Refresh Lists based on current tab
      if(activeTab === 'history') fetchMyAuctionHistory();
      else { fetchMyArts(); fetchActiveAuctions(); }

    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to close auction'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePremium = async () => {
    if (!user?.id) return;
    if (user.walletBalance < 500) {
      toast.error("Insufficient balance. Premium costs $500.");
      setShowAddMoneyModal(true);
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.post(`/users/${user.id}/upgrade`);
      const profileResponse = await axiosInstance.get('/users/profile');
      updateUser(profileResponse.data);
      toast.success('Upgraded to Premium!');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Upgrade failed'));
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const amount = parseFloat(addMoneyAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/users/${user.id}/add-money`, null, {
        params: { amount },
      });
      updateUser(response.data); 
      toast.success('Money added!');
      setShowAddMoneyModal(false);
      setAddMoneyAmount('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add money'));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadArt = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const priceVal = parseFloat(formData.get('price'));
    if (isNaN(priceVal) || priceVal < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    setLoading(true);
    try {
      const artData = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: priceVal,
        imageUrl: formData.get('imageUrl'),
      };
      await axiosInstance.post('/art/create', artData);
      toast.success('Art uploaded successfully!');
      e.target.reset();
      // If we are on myart tab, refresh
      if (activeTab === 'myart') fetchMyArts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Upload failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    const artIdVal = parseInt(auctionForm.artId);
    const startPriceVal = parseFloat(auctionForm.startingPrice);
    if (isNaN(artIdVal) || isNaN(startPriceVal)) {
        toast.error("Invalid input");
        return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/auctions/create', {
        artId: artIdVal,
        startingPrice: startPriceVal,
        endTime: auctionForm.endTime,
      });
      toast.success('Auction created!');
      setShowAuctionModal(false);
      setAuctionForm({ artId: '', startingPrice: '', endTime: '' });
      
      // Refresh relevant data
      if(activeTab === 'history') fetchMyAuctionHistory();
      else { fetchMyArts(); fetchActiveAuctions(); }

    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create auction'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Artist Dashboard</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-gray-400">Manage your artworks and wallet</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-dark-card px-4 py-2 rounded border border-gray-700">
                <span className="text-gray-300">
                  Wallet: <span className="text-gold font-bold ml-2">${user?.walletBalance ? user.walletBalance.toFixed(2) : '0.00'}</span>
                </span>
              </div>
              <button onClick={() => setShowAddMoneyModal(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition">
                + Add Money
              </button>
              {!isPremiumUser ? (
                 <button onClick={handleUpgradePremium} disabled={loading} className="px-4 py-2 bg-gold text-dark-bg font-semibold rounded hover:bg-yellow-600 transition disabled:opacity-50">
                   {loading ? 'Processing...' : 'Upgrade Premium ($500)'}
                 </button>
              ) : (
                <span className="px-4 py-2 bg-gold text-dark-bg font-semibold rounded-lg shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                  ⭐ Premium Artist
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button onClick={() => setActiveTab('upload')} className={`px-6 py-3 font-semibold transition ${activeTab === 'upload' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}>Upload Art</button>
          <button onClick={() => setActiveTab('myart')} className={`px-6 py-3 font-semibold transition ${activeTab === 'myart' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}>My Portfolio</button>
          {/* NEW TAB FOR HISTORY */}
          <button onClick={() => setActiveTab('history')} className={`px-6 py-3 font-semibold transition ${activeTab === 'history' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}>Auction History</button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-dark-card rounded-xl p-8 border border-gray-800 max-w-2xl mx-auto shadow-lg">
             <h2 className="text-2xl font-bold mb-6 text-gold">Upload New Artwork</h2>
             <form onSubmit={handleUploadArt} className="space-y-6">
                <div>
                   <label className="block text-gray-300 mb-2">Title</label>
                   <input type="text" name="title" required className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded text-white focus:border-gold outline-none" />
                </div>
                <div>
                   <label className="block text-gray-300 mb-2">Description</label>
                   <textarea name="description" required rows="4" className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded text-white focus:border-gold outline-none"></textarea>
                </div>
                <div>
                   <label className="block text-gray-300 mb-2">Price ($)</label>
                   <input type="number" name="price" step="0.01" required className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded text-white focus:border-gold outline-none" />
                </div>
                <div>
                   <label className="block text-gray-300 mb-2">Image URL</label>
                   <input type="url" name="imageUrl" required placeholder="https://..." className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded text-white focus:border-gold outline-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-dark-bg font-bold rounded hover:bg-yellow-600 transition">
                  {loading ? 'Uploading...' : 'Upload Artwork'}
                </button>
             </form>
          </div>
        )}

        

        {/* My Portfolio Tab */}
        {activeTab === 'myart' && (
          <div>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gold">My Gallery (Created by Me)</h2>
               <div className="flex flex-col items-end">
                 <button 
                   onClick={() => setShowAuctionModal(true)} 
                   disabled={!isPremiumUser} 
                   className={`px-6 py-2 font-bold rounded transition ${isPremiumUser ? 'bg-gold text-dark-bg hover:bg-yellow-600 cursor-pointer shadow-md' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                 >
                   + Create Auction
                 </button>
               </div>
            </div>
            
            {artsLoading ? (
               <div className="text-center py-20"><p className="text-gold text-xl animate-pulse">Loading gallery...</p></div>
            ) : myArts.length === 0 ? (
               <div className="text-center py-20 bg-dark-card rounded border border-gray-800">
                 <p className="text-gray-400">No artworks found.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myArts.map((art) => (
                      <div 
                        key={art.id} 
                        className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 hover:border-gold transition duration-300 shadow-md flex flex-col cursor-pointer relative group"
                        onClick={() => handleViewDetails(art)}
                      >
                        <div className="h-64 bg-gray-900 relative">
                            <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                            <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded font-bold ${art.status === 'IN_GALLERY' ? 'bg-green-600 text-white' : art.status === 'SOLD' ? 'bg-red-600 text-white' : 'bg-gold text-dark-bg'}`}>
                              {art.status?.replace('_', ' ')}
                            </span>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                               {art.status === 'ON_AUCTION' && (
                                 <span className="opacity-0 group-hover:opacity-100 bg-gold text-dark-bg font-bold px-4 py-2 rounded transform translate-y-2 group-hover:translate-y-0 transition-all">
                                   View Bids & Manage
                                 </span>
                               )}
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-xl font-bold text-white truncate">{art.title}</h3>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-gold font-bold text-lg">${art.price?.toFixed(2)}</span>
                            </div>
                            <p className="text-gray-400 text-sm mt-2 line-clamp-2">{art.description}</p>
                        </div>
                      </div>
                  ))}
               </div>
            )}
          </div>
        )}

        {/* ---------------- NEW TAB: AUCTION HISTORY ---------------- */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold text-gold mb-6">Auction History</h2>
            
            {artsLoading ? (
               <div className="text-center py-20"><p className="text-gold text-xl animate-pulse">Loading history...</p></div>
            ) : myAuctions.length === 0 ? (
               <div className="text-center py-20 bg-dark-card rounded border border-gray-800">
                 <p className="text-gray-400">No auction history found.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {myAuctions.map((auction) => (
                     <div key={auction.id} className="bg-dark-card rounded-lg p-6 border border-gray-800 flex flex-col md:flex-row gap-6 items-center hover:border-gray-600 transition">
                        <div className="w-24 h-24 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                           <img src={auction.art?.imageUrl} alt="art" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                           <h3 className="text-xl font-bold text-white">{auction.art?.title}</h3>
                           <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                              <span>Start Price: <span className="text-gray-200">${auction.startingPrice}</span></span>
                              <span>Highest Bid: <span className="text-gold font-bold">${auction.currentHighestBid}</span></span>
                              <span>Ends: {new Date(auction.endTime).toLocaleString()}</span>
                           </div>
                           
                           {/* Winner Display */}
                           {!auction.active && auction.winner && (
                             <div className="mt-3 text-green-400 font-bold border-t border-gray-700 pt-2">
                               🏆 Sold to: {auction.winner.name || auction.winner.email} for ${auction.currentHighestBid}
                             </div>
                           )}
                           
                           {!auction.active && !auction.winner && (
                             <div className="mt-3 text-gray-500 font-bold border-t border-gray-700 pt-2">
                               🚫 Closed without winner (Unsold)
                             </div>
                           )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                           <span className={`px-3 py-1 rounded font-bold text-sm ${auction.active ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                              {auction.active ? 'ACTIVE' : 'CLOSED'}
                           </span>
                           <button 
                             onClick={() => { setSelectedAuction(auction); setShowDetailsModal(true); }}
                             className="text-gold hover:text-white underline text-sm"
                           >
                             View Details
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
          </div>
        )}

        {/* ---------------- MODALS ---------------- */}

        {/* Auction Details & Bidders Modal */}
        {showDetailsModal && selectedAuction && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-dark-card rounded-xl p-8 max-w-3xl w-full border border-gold shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row gap-8 mb-8">
                 {/* Image */}
                 <div className="w-full md:w-5/12 h-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    <img src={selectedAuction.art?.imageUrl} alt="art" className="w-full h-full object-cover"/>
                 </div>
                 
                 {/* Auction Info */}
                 <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-gold mb-2">{selectedAuction.art?.title}</h2>
                    <p className="text-gray-400 mb-6">{selectedAuction.art?.description}</p>
                    
                    {/* --- WINNER DISPLAY SECTION --- */}
                    {selectedAuction.winner ? (
                       <div className="bg-gradient-to-r from-green-900 to-transparent border-l-4 border-green-500 p-5 rounded-r-lg mb-4 animate-pulse-slow">
                          <h3 className="text-green-300 font-bold text-xl mb-1">🎉 Auction Closed!</h3>
                          <div className="text-white mt-2">
                             <p className="text-sm text-gray-300">Winner:</p>
                             <p className="text-2xl font-bold">{selectedAuction.winner.name || selectedAuction.winner.email}</p>
                          </div>
                          <div className="mt-2 text-gold font-bold">
                             Sold for: ${Number(selectedAuction.currentHighestBid).toFixed(2)}
                          </div>
                       </div>
                    ) : (
                       <div className="bg-gray-800 bg-opacity-50 p-5 rounded-lg border border-gray-700">
                          <div className="flex justify-between items-end mb-2">
                             <div>
                                <p className="text-gray-400 text-sm">Current Highest Bid</p>
                                <p className="text-gold font-bold text-3xl">${Number(selectedAuction.currentHighestBid || 0).toFixed(2)}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-gray-400 text-sm">Status</p>
                                <p className={`font-bold uppercase tracking-wider ${selectedAuction.active ? 'text-green-400' : 'text-red-400'}`}>
                                  {selectedAuction.active ? 'Active' : 'Closed'}
                                </p>
                             </div>
                          </div>
                          
                          {selectedAuction.active && (
                            <button
                              onClick={() => handleCloseAuction(selectedAuction.id)}
                              disabled={loading}
                              className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-lg transition transform hover:scale-[1.02]"
                            >
                              {loading ? 'Closing...' : 'Close Auction & Declare Winner'}
                            </button>
                          )}
                       </div>
                    )}
                 </div>
              </div>

              {/* Bidders Table */}
              <div className="bg-dark-bg rounded-lg overflow-hidden border border-gray-800">
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-800 bg-opacity-40">
                   <h3 className="text-lg font-bold text-white">Bid History</h3>
                </div>
                
                {selectedAuction.bids && selectedAuction.bids.length > 0 ? (
                  <div className="overflow-x-auto max-h-60 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-800 text-gray-400 sticky top-0">
                        <tr>
                          <th className="p-4 font-medium">Bidder</th>
                          <th className="p-4 font-medium">Amount</th>
                          <th className="p-4 font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {[...selectedAuction.bids].sort((a,b) => b.amount - a.amount).map((bid) => {
                          const bidderName = bid.bidder?.name || bid.bidder?.email || "Unknown User";
                          const bidAmount = Number(bid.amount || 0);

                          return (
                            <tr key={bid.id} className="hover:bg-gray-800 transition">
                              <td className="p-4 text-white">
                                 {bidderName}
                                 {selectedAuction.winner && (bid.bidder?.id === selectedAuction.winner.id) && (
                                   <span className="ml-3 text-xs bg-gold text-dark-bg px-2 py-1 rounded font-bold">WINNER</span>
                                 )}
                              </td>
                              <td className="p-4 text-gold font-bold">${bidAmount.toFixed(2)}</td>
                              <td className="p-4 text-gray-500 text-sm">
                                {new Date(bid.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                     <p>No bids have been placed yet.</p>
                  </div>
                )}
              </div>
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

        {/* Create Auction Modal */}
        {showAuctionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-dark-card rounded-xl p-8 max-w-md w-full border border-gold shadow-2xl relative">
                <button onClick={() => setShowAuctionModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>
                <h2 className="text-2xl font-bold mb-6 text-gold text-center">Start Auction</h2>
                <form onSubmit={handleCreateAuction} className="space-y-5">
                   <div>
                     <label className="block text-gray-300 mb-2">Select Artwork</label>
                     <select value={auctionForm.artId} onChange={(e) => setAuctionForm({...auctionForm, artId: e.target.value})} required className="w-full p-3 bg-dark-bg border border-gray-700 rounded text-white focus:border-gold outline-none">
                        <option value="">-- Choose Art --</option>
                        {myArts.filter(a => a.status === 'IN_GALLERY').map(a => (
                           <option key={a.id} value={a.id}>{a.title} (${a.price})</option>
                        ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-gray-300 mb-2">Starting Bid ($)</label>
                     <input type="number" min="1" step="0.01" value={auctionForm.startingPrice} onChange={(e) => setAuctionForm({...auctionForm, startingPrice: e.target.value})} required className="w-full p-3 bg-dark-bg border border-gray-700 rounded text-white focus:border-gold outline-none" />
                   </div>
                   <div>
                     <label className="block text-gray-300 mb-2">End Time</label>
                     <input type="datetime-local" value={auctionForm.endTime} onChange={(e) => setAuctionForm({...auctionForm, endTime: e.target.value})} required className="w-full p-3 bg-dark-bg border border-gray-700 rounded text-white focus:border-gold outline-none" />
                   </div>
                   <div className="flex gap-4 mt-6">
                      <button type="submit" disabled={loading} className="flex-1 bg-gold text-dark-bg py-3 rounded font-bold hover:bg-yellow-600 transition">{loading ? 'Creating...' : 'Launch Auction'}</button>
                      <button type="button" onClick={() => setShowAuctionModal(false)} className="flex-1 bg-gray-700 text-white py-3 rounded hover:bg-gray-600 transition">Cancel</button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDashboard;