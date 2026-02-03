package com.artevo.service.impl;

import com.artevo.dto.ArtDto;
import com.artevo.entity.*;
import com.artevo.enums.*;
import com.artevo.repository.*;
import com.artevo.service.ArtService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ArtServiceImpl implements ArtService {
    @Autowired private ArtRepository artRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ModelMapper modelMapper;
    @Autowired private TransactionRepository transactionRepository;

    @Override
    public Art createArt(ArtDto artDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User artist = userRepository.findByEmail(email).orElseThrow();
        if(artist.getRole() != Role.ARTIST) throw new AccessDeniedException("Only artists can upload");
        
        Art art = modelMapper.map(artDto, Art.class);
        art.setArtist(artist);
        art.setOwner(artist); 
        art.setStatus(ArtStatus.IN_GALLERY);
        return artRepository.save(art);
    }

    @Override
    public void buyArtDirectly(Long artId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email).orElseThrow();
        
        Art art = artRepository.findById(artId).orElseThrow(() -> new RuntimeException("Art not found"));

        if(art.getStatus() != ArtStatus.IN_GALLERY) throw new RuntimeException("Art not for sale");
        if(buyer.getWalletBalance() < art.getPrice()) throw new RuntimeException("Insufficient Funds");

        User artist = art.getArtist(); 
        
        // 1. Handle Money
        buyer.setWalletBalance(buyer.getWalletBalance() - art.getPrice());
        artist.setWalletBalance(artist.getWalletBalance() + art.getPrice());
        
        // 2. Update Art Status
        art.setStatus(ArtStatus.SOLD);

        // 3. Transfer Ownership
        art.setOwner(buyer); 

        // 4. Logs
        transactionRepository.save(Transaction.builder()
            .user(buyer).amount(art.getPrice()).type("PURCHASE").timestamp(LocalDateTime.now()).build());

        transactionRepository.save(Transaction.builder()
            .user(artist).amount(art.getPrice()).type("SALE").timestamp(LocalDateTime.now()).build());

        userRepository.save(buyer);
        userRepository.save(artist);
        artRepository.save(art);
    }

    // --- NEW: For Buyers (What I own) ---
    @Override
    public List<Art> getMyCollection() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        return artRepository.findByOwner(currentUser);
    }
    
    // --- NEW: For Artists (What I created) ---
    @Override
    public List<Art> getMyPortfolio() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        return artRepository.findByArtist(currentUser);
    }

    // Default method (Legacy support if needed, defaults to Collection/Owned)
    @Override
    public List<Art> getMyArtworks() {
        return getMyCollection();
    }
    
    @Override
    public List<Art> getAllGalleryArt() { return artRepository.findByStatus(ArtStatus.IN_GALLERY); }
}