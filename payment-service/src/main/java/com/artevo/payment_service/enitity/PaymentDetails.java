package com.artevo.payment_service.enitity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "payment_details")
public class PaymentDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;      // ID from Razorpay
    private String currency;
    private Double amount;
    private String userEmail;    // Who is paying
    private String status;       // CREATED, PAID, FAILED
    
    // Fields filled after payment success
    private String paymentId;    
    
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}