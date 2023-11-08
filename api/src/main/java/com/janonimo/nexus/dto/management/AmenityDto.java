package com.janonimo.nexus.dto.management;

import com.janonimo.nexus.core.models.Amenity;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class AmenityDto {

    private int id;
    private double rate;
    private String description;

    public AmenityDto(@NotNull Amenity amenity){
        this.id = amenity.getId();
        this.rate = amenity.getRate();
        this.description = amenity.getDescription();
    }
    public Amenity getAmenity(){
        Amenity amenity = Amenity.builder()
                .description(this.description).created(LocalDateTime.now()).rate(this.rate).build();
        if(this.id > 0){
            amenity.setId(this.id);
        }
        return amenity;
    }
}
