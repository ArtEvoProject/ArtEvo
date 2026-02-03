package com.artevo.payment_service.service.impl;


import com.artevo.payment_service.enitity.PaymentDetails;
import com.artevo.payment_service.repository.PaymentRepository;
import com.artevo.payment_service.service.PaymentService;
// import com.razorpay.Order;
// import com.razorpay.RazorpayClient;
// import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    // TODO: Replace with your actual Keys from Razorpay Dashboard
   // REPLACE WITH YOUR REAL KEYS
private final String KEY_ID = "rzp_test_123456789"; 
private final String KEY_SECRET = "AbCdeFgHiJkLmNoP";

   @Override
    public PaymentDetails createOrder(Double amount, String userEmail) {
        // --- MOCK MODE (No Razorpay Account) ---
        
        // 1. Generate a Fake Order ID
        String mockOrderId = "order_mock_" + System.currentTimeMillis();

        // 2. Save to Database as if it was real
        PaymentDetails payment = new PaymentDetails();
        payment.setOrderId(mockOrderId);
        payment.setAmount(amount);
        payment.setCurrency("INR");
        payment.setUserEmail(userEmail);
        payment.setStatus("CREATED"); // Initial status

        System.out.println(">> MOCK ORDER CREATED: " + mockOrderId);

        return paymentRepository.save(payment);
    }

    @Override
    public PaymentDetails updatePaymentStatus(String orderId, String paymentId, String status) {
        PaymentDetails payment = paymentRepository.findByOrderId(orderId);
        if (payment != null) {
            payment.setPaymentId(paymentId);
            payment.setStatus(status);
            return paymentRepository.save(payment);
        }
        return null;
    }
}