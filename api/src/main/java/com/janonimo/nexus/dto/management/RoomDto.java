package com.janonimo.nexus.dto.management;

import com.janonimo.nexus.core.models.Amenity;
import com.janonimo.nexus.core.models.Room;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
public class RoomDto {
    private int id;
    private String type;
    private String resource;
    private double rate;
    private List<String> amenities;
    private String status;
    private String roomNumber;

    private String occupant;

    public RoomDto(@NotNull Room room) {
        this.id = room.getId();
        this.type = room.getType();
        this.rate = room.getRate();
        this.status = room.getRoomStatus().name();
        this.resource = room.getResource();
        this.roomNumber =room.getRoomNumber();
        List<Amenity> amnts = room.getAmenities();
        if (amnts != null) {
            amenities = new ArrayList<>();
            for (Amenity amenity : amnts) {
                amenities.add(amenity.getDescription());
            }
        }
    }

    public void assignAmenities(List<Amenity> pAmenities) {
        amenities = new ArrayList<>();
        for (Amenity amenity : pAmenities) {
            this.amenities.add(amenity.getDescription());
        }
    }
}
