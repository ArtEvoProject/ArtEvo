package com.artevo.entity;

import com.artevo.enums.ArtStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Art {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    // FIX 1: Increase length for descriptions (Default is usually 255)
    // You can also use columnDefinition = "TEXT" for very long descriptions
    @Column(length = 1000) 
    private String description;

    // NOTE: For money, 'BigDecimal' is preferred over 'Double' to avoid precision errors, 
    // but Double will work without crashing.
    private Double price; 
    
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    // FIX 2: Ensure the column is wide enough for the longest Enum word (e.g., "AVAILABLE")
    @Column(length = 30) 
    private ArtStatus status;

    @ManyToOne
@JoinColumn(name = "owner_id") // Separate from "artist_id"
private User owner;

    @ManyToOne
    @JoinColumn(name = "artist_id")
    @JsonIgnoreProperties({"password", "otp", "otpGeneratedTime", "authorities", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User artist;
}