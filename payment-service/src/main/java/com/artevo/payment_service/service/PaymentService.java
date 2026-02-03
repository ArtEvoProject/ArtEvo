package com.artevo.payment_service.service;

import com.artevo.payment_service.enitity.PaymentDetails;

public interface PaymentService {
    
    // Create an order in Razorpay and save to DB
    PaymentDetails createOrder(Double amount, String userEmail);
    
    // Update status when payment is successful
    PaymentDetails updatePaymentStatus(String orderId, String paymentId, String status);
}