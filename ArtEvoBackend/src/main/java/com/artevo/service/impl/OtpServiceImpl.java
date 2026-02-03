package com.artevo.service.impl;

import com.artevo.entity.User;
import com.artevo.repository.UserRepository;
import com.artevo.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpServiceImpl implements OtpService {

    @Autowired private UserRepository userRepository;
    
    // If you haven't set up SMTP yet, you can comment out the mail sender parts 
    // and just look at the console logs for the OTP.
    @Autowired(required = false) 
    private JavaMailSender mailSender; 

    @Override
    public String generateOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Generate 6-digit Random OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // 2. Save to DB
        user.setOtp(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        userRepository.save(user);

        // 3. Send Email (or Log it)
        sendEmail(email, otp);

        return "OTP sent to email";
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() == null || user.getOtpGeneratedTime() == null) {
            throw new RuntimeException("No OTP generated");
        }

        // Check if OTP matches
        if (!user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        // Check if OTP is expired (e.g., 5 minutes limit)
        if (user.getOtpGeneratedTime().plusMinutes(5).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP Expired");
        }

        return true; // Valid
    }

    private void sendEmail(String to, String otp) {
        // Log to console for testing (Visible in IntelliJ/Eclipse run tab)
        System.out.println("=================================");
        System.out.println("Generated OTP for " + to + ": " + otp);
        System.out.println("=================================");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject("Your ArtEvo OTP");
                message.setText("Your OTP for password reset is: " + otp);
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
        }
    }
}