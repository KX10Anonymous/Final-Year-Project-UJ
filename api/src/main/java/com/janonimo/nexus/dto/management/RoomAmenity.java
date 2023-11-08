package com.janonimo.nexus.dto.management;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class RoomAmenity {
    private String amenity;
    private int roomId;
}
