package com.artevo.controller;

import com.artevo.dto.AuctionDto;
import com.artevo.entity.Auction;
import com.artevo.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    @Autowired private AuctionService auctionService;

    // 1. Create Auction
    @PostMapping("/create")
    public ResponseEntity<Auction> createAuction(@RequestBody AuctionDto dto) {
        return ResponseEntity.ok(auctionService.createAuction(dto));
    }

    // 2. Get All ACTIVE Auctions (For Buyers)
    // --- THIS WAS THE CONFLICTING METHOD. I KEPT ONLY THIS ONE ---
    @GetMapping
    public ResponseEntity<List<Auction>> getActiveAuctions() {
        return ResponseEntity.ok(auctionService.getAllActiveAuctions());
    }

    // 3. Get My Auction History (For Sellers - Active + Closed)
    @GetMapping("/my-history")
    public ResponseEntity<List<Auction>> getMyAuctionHistory() {
        return ResponseEntity.ok(auctionService.getMyAuctions());
    }

    // 4. Place Bid
    @PostMapping("/{id}/bid")
    public ResponseEntity<Auction> placeBid(@PathVariable Long id, @RequestParam Double amount) {
        return ResponseEntity.ok(auctionService.placeBid(id, amount));
    }
    
    // 5. Close Auction
    @PostMapping("/{id}/close")
    public ResponseEntity<Auction> closeAuction(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.closeAuction(id));
    }
}