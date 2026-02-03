package com.artevo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "art_id", nullable = false)
    private Art art;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnoreProperties({"password", "otp", "otpGeneratedTime", "authorities", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User seller;

    @ManyToOne
    @JoinColumn(name = "highest_bidder_id")
    @JsonIgnoreProperties({"password", "otp", "otpGeneratedTime", "authorities", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User highestBidder;

    // --- ADDED: Winner Field (Fixes 'cannot find symbol setWinner') ---
    @ManyToOne
    @JoinColumn(name = "winner_id")
    @JsonIgnoreProperties({"password", "otp", "otpGeneratedTime", "authorities", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User winner;

    // --- ADDED: Bid List (Fixes 'cannot find symbol getBids') ---
    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("auction") // Prevents infinite recursion JSON error
    private List<Bid> bids;

    private Double startingPrice;
    private Double currentHighestBid;
    
    // --- ADDED: Final Price (Optional but good for history) ---
    private Double finalPrice;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    @Builder.Default // Ensures builder uses the default value
    private boolean active = true;
}