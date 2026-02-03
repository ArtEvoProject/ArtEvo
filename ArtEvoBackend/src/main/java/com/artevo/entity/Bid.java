package com.artevo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- 1. IMPORT THIS
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "auction_id")
    @JsonIgnore // <--- 2. ADD THIS (Stops the Infinite Loop)
    private Auction auction;

    @ManyToOne
    @JoinColumn(name = "bidder_id")
    
    // This part you already had is good (hides sensitive user info)
    @JsonIgnoreProperties({"password", "otp", "otpGeneratedTime", "authorities", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "walletBalance"})
    private User bidder;
}