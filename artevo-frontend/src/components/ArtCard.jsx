const ArtCard = ({ art, onBuy, onBid, showBuyButton = false, showBidButton = false }) => {
  return (
    <div className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 hover:border-gold transition group">
      <div className="relative h-64 bg-gray-900 overflow-hidden">
        {art.imageUrl ? (
          <img
            src={art.imageUrl}
            alt={art.title}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            No Image
          </div>
        )}
        {art.status === 'SOLD' && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            SOLD
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-white">{art.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{art.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gold text-2xl font-bold">${art.price?.toFixed(2)}</p>
            {art.artist && (
              <p className="text-gray-500 text-sm">by {art.artist.name || 'Unknown'}</p>
            )}
          </div>
        </div>
        {showBuyButton && art.status === 'IN_GALLERY' && (
          <button
            onClick={() => onBuy(art.id)}
            className="w-full py-2 bg-gold hover:bg-gold-light text-dark-bg font-semibold rounded-lg transition"
          >
            Buy Now
          </button>
        )}
        {showBidButton && art.status === 'IN_AUCTION' && (
          <button
            onClick={() => onBid(art.id)}
            className="w-full py-2 bg-gold hover:bg-gold-light text-dark-bg font-semibold rounded-lg transition"
          >
            Place Bid
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtCard;
