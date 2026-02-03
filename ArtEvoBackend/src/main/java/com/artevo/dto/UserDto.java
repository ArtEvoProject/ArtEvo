package com.artevo.dto;
import com.artevo.enums.Role;
import lombok.Data;
@Data public class UserDto { private String name; private String email; private String password; private Role role; }