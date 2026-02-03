package com.artevo.service;
import com.artevo.entity.User;
public interface UserService {
    User getUserProfile(String email);
    User addMoney(Long userId, Double amount);
    User upgradeToPremium(Long userId);
}