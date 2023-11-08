package com.janonimo.nexus.core.services;

import com.janonimo.nexus.core.models.Amenity;
import com.janonimo.nexus.core.models.Room;
import com.janonimo.nexus.core.repositories.AmenityRepository;
import com.janonimo.nexus.dto.management.AmenityDto;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@SuppressWarnings("ALL")
@Service
@AllArgsConstructor
public class AmenityService {
    private final AmenityRepository amenityRepository;

    @SuppressWarnings("unused")
    public Amenity create(@NotNull AmenityDto request){
        return amenityRepository.save(request.getAmenity());
    }

    @SuppressWarnings("unused")
    public boolean delete(int id){
        if(amenityRepository.existsById(id)){
            amenityRepository.delete(amenityRepository.getReferenceById(id));
        }
        return amenityRepository.existsById(id);
    }

    public List<Amenity> getRoomAmenities(Room room){
        return amenityRepository.findByRoom(room.getId());
    }

    public List<AmenityDto> amenities(){
        List<AmenityDto> response = null;
        List<Amenity> amenities =  amenityRepository.findAll();
        if(amenities != null){
            response = new ArrayList<>();
            for(Amenity amenity : amenities){
                response.add(new AmenityDto(amenity));
            }
        }
        return response;
    }

    public List<String> names(){
        List<Amenity> amenities = amenityRepository.findAll();
        List<String> names = new ArrayList<>();
        if(amenities != null){
            for(Amenity amenity : amenities){
               if(!names.contains(amenity.getDescription())){
                   names.add(amenity.getDescription());
               }
            }
        }
        return names;
    }
}
