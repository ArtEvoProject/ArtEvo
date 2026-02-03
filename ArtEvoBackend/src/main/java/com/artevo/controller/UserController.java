package com.artevo.controller;
import com.artevo.entity.User;
import com.artevo.service.UserService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired private UserService userService;
    @Autowired private com.artevo.repository.TransactionRepository transactionRepository;
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        return ResponseEntity.ok(userService.getUserProfile(SecurityContextHolder.getContext().getAuthentication().getName()));
    }
    @PostMapping("/{id}/add-money")
    public ResponseEntity<User> addMoney(@PathVariable Long id, @RequestParam Double amount) {
        User current = userService.getUserProfile(SecurityContextHolder.getContext().getAuthentication().getName());
        if (!current.getId().equals(id)) {
            throw new RuntimeException("Can only add money to your own account");
        }
        return ResponseEntity.ok(userService.addMoney(id, amount));
    }
    @PostMapping("/{id}/upgrade")
    public ResponseEntity<User> upgrade(@PathVariable Long id) {
        User current = userService.getUserProfile(SecurityContextHolder.getContext().getAuthentication().getName());
        if (!current.getId().equals(id)) {
            throw new RuntimeException("Can only upgrade your own account");
        }
        return ResponseEntity.ok(userService.upgradeToPremium(id));
    }
    @GetMapping("/history")
    public ResponseEntity<List<com.artevo.entity.Transaction>> getMyHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserProfile(email);
        return ResponseEntity.ok(transactionRepository.findByUser(user));
    }
}