package com.artevo.entity;

import com.artevo.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(unique = true)
    private String email;
    
    @JsonIgnore
    private String password;

    // FIX: Define length to prevent "Data truncated" error
    // 'ARTIST' is 6 chars, so 30 is plenty of space.
    @Enumerated(EnumType.STRING)
    @Column(length = 30) 
    private Role role;

    private Double walletBalance = 0.0;
    private boolean isPremium = false;
    
    @JsonIgnore
    private String otp;
    @JsonIgnore
    private java.time.LocalDateTime otpGeneratedTime;

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    @Override 
    @JsonIgnore
    public String getUsername() { return email; }
    @Override 
    @JsonIgnore
    public boolean isAccountNonExpired() { return true; }
    @Override 
    @JsonIgnore
    public boolean isAccountNonLocked() { return true; }
    @Override 
    @JsonIgnore
    public boolean isCredentialsNonExpired() { return true; }
    @Override 
    @JsonIgnore
    public boolean isEnabled() { return true; }
}