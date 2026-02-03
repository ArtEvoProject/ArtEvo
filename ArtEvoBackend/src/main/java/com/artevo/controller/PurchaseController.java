package com.artevo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController // Use RestController for API
@RequestMapping("api/purchase")
@CrossOrigin("*") // Allow React Frontend to call this
public class PurchaseController {

    @Autowired
    private RestTemplate restTemplate;

    // URL of your NEW Microservice (running on port 8081)
    private final String PAYMENT_SERVICE_URL = "http://localhost:8081/payment/create-order";

    @PostMapping("/initiate")
    public String initiatePurchase(@RequestParam Double amount, @RequestParam String userEmail) {
        
        // 1. Build the URL to call the Microservice
        String url = PAYMENT_SERVICE_URL + "?amount=" + amount + "&userEmail=" + userEmail;

        // 2. Call the Microservice and get the response (JSON)
        // The Microservice returns a PaymentDetails object, we just need the 'orderId' map
        try {
            Map<String, Object> paymentDetails = restTemplate.postForObject(url, null, Map.class);
            
            // 3. Extract orderId and return to Frontend
            if (paymentDetails != null && paymentDetails.get("orderId") != null) {
                return paymentDetails.get("orderId").toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return "ERROR";
    }
}