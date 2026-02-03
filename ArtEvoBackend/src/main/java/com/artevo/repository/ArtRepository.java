package com.artevo.repository;
import com.artevo.entity.Art;
import com.artevo.entity.User;
import com.artevo.enums.ArtStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ArtRepository extends JpaRepository<Art, Long> {
    List<Art> findByStatus(ArtStatus status);
    List<Art> findByArtist(User artist);
    List<Art> findByOwner(User owner);
}