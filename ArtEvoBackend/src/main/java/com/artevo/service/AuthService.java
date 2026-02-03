package com.artevo.service;
import com.artevo.dto.*;
public interface AuthService {
    String register(UserDto userDto);
    AuthResponse login(AuthRequest request);
    String forgotPassword(ForgotPasswordRequest request);
    String verifyOtp(VerifyOtpRequest request);
    String resetPassword(ResetPasswordRequest request);
}