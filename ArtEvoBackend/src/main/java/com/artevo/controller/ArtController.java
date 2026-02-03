package com.artevo.controller;
import com.artevo.dto.ArtDto;
import com.artevo.entity.Art;
import com.artevo.service.ArtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/art")
public class ArtController {
    @Autowired private ArtService artService;

    @PostMapping("/create")
    public ResponseEntity<Art> create(@RequestBody ArtDto dto) { 
        return ResponseEntity.ok(artService.createArt(dto)); 
    }

    @PostMapping("/buy/{id}")
    public ResponseEntity<String> buy(@PathVariable Long id) {
        artService.buyArtDirectly(id);
        return ResponseEntity.ok("Purchase Successful");
    }

    // Matches axios.get('/art')
    @GetMapping("/gallery")
    public ResponseEntity<List<Art>> getGallery() { 
        return ResponseEntity.ok(artService.getAllGalleryArt()); 
    }

    // OLD ENDPOINT (Kept for safety, returns Owned items)
    @GetMapping("/my-artworks")
    public ResponseEntity<List<Art>> getMyArtworks() { 
        return ResponseEntity.ok(artService.getMyArtworks()); 
    }

    // NEW: For Buyer Dashboard -> "My Purchases"
    @GetMapping("/collection")
    public ResponseEntity<List<Art>> getMyCollection() { 
        return ResponseEntity.ok(artService.getMyCollection()); 
    }

    // NEW: For Artist Dashboard -> "My Creations"
    @GetMapping("/portfolio")
    public ResponseEntity<List<Art>> getMyPortfolio() { 
        return ResponseEntity.ok(artService.getMyPortfolio()); 
    }
}