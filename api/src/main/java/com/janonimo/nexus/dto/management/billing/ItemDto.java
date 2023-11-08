package com.janonimo.nexus.dto.management.billing;

import com.janonimo.nexus.core.models.Amenity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class ItemDto {
    public ItemDto(Amenity amenity){
        if(amenity != null){
            this.rate = amenity.getRate();
            this.name = amenity.getDescription();
        }
    }
    private String name;
    private double rate;
}
