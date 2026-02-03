package com.artevo.service;
import com.artevo.dto.ArtDto;
import com.artevo.entity.Art;
import java.util.List;
public interface ArtService {
    Art createArt(ArtDto artDto);
    void buyArtDirectly(Long artId);
    List<Art> getAllGalleryArt();
    List<Art> getMyArtworks();
    List<Art> getMyCollection();
    List<Art> getMyPortfolio();
    //public void buyArtDirectly(Long artId)
}