package com.artevo.service.impl;

import com.artevo.entity.Transaction;
import com.artevo.entity.User;
import com.artevo.enums.Role;
import com.artevo.repository.TransactionRepository;
import com.artevo.repository.UserRepository;
import com.artevo.service.UserService;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    @Autowired private UserRepository userRepository;
    @Autowired private TransactionRepository transactionRepository;

    @Override
    public User getUserProfile(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
    @Override
    public User addMoney(Long userId, Double amount) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if(amount <= 0) throw new RuntimeException("Amount must be positive");
        user.setWalletBalance(user.getWalletBalance() + amount);
        
        // NEW: Save Transaction History
        Transaction log = Transaction.builder()
            .user(user)
            .amount(amount)
            .type("DEPOSIT")
            .timestamp(LocalDateTime.now())
            .build();
        transactionRepository.save(log);
        return userRepository.save(user);
    }
    @Override
    public User upgradeToPremium(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if(user.getRole() != Role.ARTIST) throw new RuntimeException("Only Artists can upgrade");
        if(user.isPremium()) throw new RuntimeException("Already Premium");
        if(user.getWalletBalance() < 500) throw new RuntimeException("Insufficient Funds (500 needed)");
        
        user.setWalletBalance(user.getWalletBalance() - 500);
        user.setPremium(true);
        return userRepository.save(user);
    }
}