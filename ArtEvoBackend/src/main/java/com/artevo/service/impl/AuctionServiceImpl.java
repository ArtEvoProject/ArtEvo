package com.artevo.service.impl;

import com.artevo.dto.AuctionDto;
import com.artevo.entity.*;
import com.artevo.enums.*;
import com.artevo.repository.*;
import com.artevo.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AuctionServiceImpl implements AuctionService {
    @Autowired private AuctionRepository auctionRepository;
    @Autowired private ArtRepository artRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BidRepository bidRepository;

    @Override
    public Auction createAuction(AuctionDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User artist = userRepository.findByEmail(email).orElseThrow();

        if(artist.getRole() != Role.ARTIST) throw new AccessDeniedException("Not Artist");
        // if(!artist.isPremium()) throw new AccessDeniedException("Premium Upgrade Required"); // Uncomment if needed

        Art art = artRepository.findById(dto.getArtId()).orElseThrow(() -> new RuntimeException("Art not found"));
        if(art.getStatus() != ArtStatus.IN_GALLERY) throw new RuntimeException("Art not available");

        Auction auction = new Auction();
        auction.setArt(art);
        auction.setSeller(artist);
        auction.setStartingPrice(dto.getStartingPrice());
        auction.setCurrentHighestBid(dto.getStartingPrice());
        auction.setStartTime(LocalDateTime.now());
        auction.setEndTime(dto.getEndTime());
        auction.setActive(true); 
        
        art.setStatus(ArtStatus.ON_AUCTION); 
        artRepository.save(art);
        return auctionRepository.save(auction);
    }

    @Override
    public Auction placeBid(Long auctionId, Double amount) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User bidder = userRepository.findByEmail(email).orElseThrow();
        Auction auction = auctionRepository.findById(auctionId).orElseThrow(() -> new RuntimeException("Auction not found"));

        if(!auction.isActive() || LocalDateTime.now().isAfter(auction.getEndTime())) throw new RuntimeException("Auction closed");
        if(amount <= auction.getCurrentHighestBid()) throw new RuntimeException("Bid too low");
        if(bidder.getWalletBalance() < amount) throw new RuntimeException("Insufficient Funds");

        Bid newBid = Bid.builder()
                .amount(amount)
                .auction(auction)
                .bidder(bidder)
                .timestamp(LocalDateTime.now())
                .build();
        bidRepository.save(newBid);

        auction.setCurrentHighestBid(amount);
        auction.setHighestBidder(bidder);
        return auctionRepository.save(auction);
    }

    @Override
    public Auction closeAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Allow closing if time is up, even if active is true
        if(!auction.isActive() && LocalDateTime.now().isBefore(auction.getEndTime())) {
            return auction; 
        }

        auction.setActive(false);
        User winner = auction.getHighestBidder();
        Art art = auction.getArt();
        User seller = auction.getSeller();

        // Check if there is a winner and they have funds
        if(winner != null && winner.getWalletBalance() >= auction.getCurrentHighestBid()) {
            double price = auction.getCurrentHighestBid();
            
            // 1. Transfer Money
            winner.setWalletBalance(winner.getWalletBalance() - price);
            seller.setWalletBalance(seller.getWalletBalance() + price);
            
            // 2. Transfer Art (CRITICAL FIX HERE)
            // OLD WRONG CODE: art.setArtist(winner); 
            // NEW CORRECT CODE:
            art.setOwner(winner); // Use setOwner so the buyer sees it in their collection!
            art.setStatus(ArtStatus.SOLD);
            
            // 3. Update Auction Winner
            auction.setWinner(winner); 

            userRepository.save(winner);
            userRepository.save(seller);
            artRepository.save(art);
        } else {
            // No winner or insufficient funds -> Return art to gallery
            art.setStatus(ArtStatus.IN_GALLERY);
            artRepository.save(art);
        }

        return auctionRepository.save(auction);
    }

    @Override
    public List<Auction> getAllActiveAuctions() { 
        return auctionRepository.findByActiveTrue(); 
    }

    @Override
    public List<Auction> getMyAuctions() {
        // 1. Get current logged-in artist
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email).orElseThrow();

        // 2. Return everything they have ever auctioned (Active, Sold, Closed)
        return auctionRepository.findBySeller(seller);
    }
}