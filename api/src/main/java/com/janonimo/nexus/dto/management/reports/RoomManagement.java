package com.janonimo.nexus.dto.management.reports;

import com.janonimo.nexus.core.models.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomManagement {
    private int id;
    private RoomStatus status;
    private int bookings;
    private int visits;
    private double revenue;
    private String roomNumber;
    private String type;
    private int numBookings;
    private List<String> amenities;
    private List<String> additional;
}
