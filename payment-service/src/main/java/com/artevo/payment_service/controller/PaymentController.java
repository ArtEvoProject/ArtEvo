package com.artevo.payment_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.artevo.payment_service.enitity.PaymentDetails;
import com.artevo.payment_service.service.PaymentService;

@RestController
@RequestMapping("/payment")
// Allow connections from your Main App (running on port 8080 or frontend port)
@CrossOrigin("*") 
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Endpoint 1: Initiate Payment
    // URL: http://localhost:8081/payment/create-order
    @PostMapping("/create-order")
    public PaymentDetails createOrder(@RequestParam Double amount, 
                                      @RequestParam String userEmail) {
        return paymentService.createOrder(amount, userEmail);
    }

    // Endpoint 2: Update Status (Optional use for now)
    @PostMapping("/update-status")
    public PaymentDetails updateStatus(@RequestParam String orderId, 
                                       @RequestParam String paymentId,
                                       @RequestParam String status) {
        return paymentService.updatePaymentStatus(orderId, paymentId, status);
    }
}