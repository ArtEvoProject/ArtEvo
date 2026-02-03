package com.artevo.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static ResponseEntity<Map<String, String>> json(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message != null ? message : ""));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        return json(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();
        if (message != null && message.contains("not found")) {
            return json(HttpStatus.NOT_FOUND, message);
        }
        if (message != null && (message.contains("already exists") || message.contains("Already"))) {
            return json(HttpStatus.CONFLICT, message);
        }
        if (message != null && message.contains("Insufficient")) {
            return json(HttpStatus.BAD_REQUEST, message);
        }
        return json(HttpStatus.BAD_REQUEST, message != null ? message : "Bad request");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("Duplicate entry")) {
            return json(HttpStatus.CONFLICT, "Email already exists");
        }
        return json(HttpStatus.BAD_REQUEST, "Data integrity violation");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        return json(HttpStatus.FORBIDDEN, ex.getMessage() != null ? ex.getMessage() : "Access denied");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        ex.printStackTrace();
        return json(HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage() != null ? ex.getMessage() : "Internal server error");
    }
}