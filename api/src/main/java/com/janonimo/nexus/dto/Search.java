package com.janonimo.nexus.dto;

import com.janonimo.nexus.core.models.Amenity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
public class Search {

    public Search(List<Amenity> amenities, LocalDateTime checkin, LocalDateTime checkout, String type){
        if (amenities != null && checkin != null && checkout != null && type != null){
            this.checkout = checkout;
            this.checkin = checkin;
            this.type = type;
            this.amenities = new ArrayList<>();
            for(Amenity amenity : amenities){
                this.amenities.add(amenity.getDescription());
            }
        }
    }

    private LocalDateTime checkin;
    private LocalDateTime checkout;
    private List<String> amenities;
    private String type;
    private String bookingId;
}
