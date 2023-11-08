package com.janonimo.nexus.core.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name="rooms")
@Builder
public class Room {
    @Id
    @GeneratedValue
    private int id;

    private String roomNumber;
    private String type;

    @Enumerated(EnumType.STRING)
    private RoomStatus roomStatus;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch=FetchType.LAZY)
    @JoinTable(name = "rooms_amenities", joinColumns = @JoinColumn(name = "room_id", referencedColumnName = "id"), inverseJoinColumns
            = @JoinColumn(name = "amenity_id", referencedColumnName = "id"))
    private List<Amenity> amenities;

    @OneToMany(mappedBy = "room", cascade = {CascadeType.MERGE}, fetch=FetchType.LAZY)
    private List<Booking> bookings;

    private double rate;

    private String resource;

    public void addAmenity(Amenity amenity){
        if(amenities == null){
            amenities = new ArrayList<>();
        }
        amenities.add(amenity);
    }
}
