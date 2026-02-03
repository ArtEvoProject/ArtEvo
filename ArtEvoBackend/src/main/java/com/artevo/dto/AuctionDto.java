package com.artevo.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data public class AuctionDto { private Long artId; private Double startingPrice; private LocalDateTime endTime; }