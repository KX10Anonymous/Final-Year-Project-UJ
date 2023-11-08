package com.janonimo.nexus.core.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "amenities")
@Builder
public class Amenity {
    @Id
    @GeneratedValue
    private int id;

    private String description;

    private double rate;

    @ManyToMany(mappedBy = "amenities", fetch=FetchType.LAZY)
    private List<Room> rooms;

    private LocalDateTime created;

}
