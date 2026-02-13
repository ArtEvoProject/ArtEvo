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

   
    @ManyToOne
    @JoinColumn(name = "winner_id")
    @JsonIgnoreProperties({"password", "otp", "otpGeneratedTime", "authorities", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User winner;

    
    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("auction") 
    private List<Bid> bids;

    private Double startingPrice;
    private Double currentHighestBid;
    
    
    private Double finalPrice;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    @Builder.Default 
    private boolean active = true;
}