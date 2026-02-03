package com.artevo.repository;
import com.artevo.entity.Transaction;
import com.artevo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
    List<Transaction> findByUser_Id(Long userId);
}