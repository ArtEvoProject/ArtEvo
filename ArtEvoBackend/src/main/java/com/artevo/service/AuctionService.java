package com.artevo.service;
import com.artevo.dto.AuctionDto;
import com.artevo.entity.Auction;
import java.util.List;
public interface AuctionService {
    Auction createAuction(AuctionDto auctionDto);
    Auction placeBid(Long auctionId, Double bidAmount);
    Auction closeAuction(Long auctionId);
    List<Auction> getAllActiveAuctions();
    List<Auction> getMyAuctions();
}