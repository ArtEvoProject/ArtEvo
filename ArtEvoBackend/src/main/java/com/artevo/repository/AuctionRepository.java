package com.artevo.repository;
import com.artevo.entity.Auction;
import com.artevo.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByActiveTrue();
    List<Auction> findBySeller(User seller);
}