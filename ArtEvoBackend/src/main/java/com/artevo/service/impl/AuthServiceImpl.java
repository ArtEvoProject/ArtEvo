package com.artevo.service.impl;

import com.artevo.dto.*;
import com.artevo.entity.User;
import com.artevo.repository.UserRepository;
import com.artevo.security.JwtService;
import com.artevo.service.AuthService;
import com.artevo.service.OtpService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private ModelMapper modelMapper;
    @Autowired private OtpService otpService;

    @Override
    public String register(UserDto userDto) {
        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = modelMapper.map(userDto, User.class);
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setWalletBalance(0.0);
        user.setPremium(false);
        userRepository.save(user);
        return "User Registered";
    }
    @Override
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        return new AuthResponse(jwtService.generateToken(user));
    }
    
    @Override
    public String forgotPassword(ForgotPasswordRequest request) {
        return otpService.generateOtp(request.getEmail());
    }
    
    @Override
    public String verifyOtp(VerifyOtpRequest request) {
        if (otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            return "OTP verified successfully";
        }
        throw new RuntimeException("Invalid or expired OTP");
    }
    
    @Override
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpGeneratedTime(null);
        userRepository.save(user);
        return "Password reset successfully";
    }
}