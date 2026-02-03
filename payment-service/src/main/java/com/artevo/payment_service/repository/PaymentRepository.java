package com.artevo.payment_service.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.artevo.payment_service.enitity.PaymentDetails;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentDetails, Long> {
    
    // Custom query to find payment by Razorpay Order ID
    PaymentDetails findByOrderId(String orderId);
}