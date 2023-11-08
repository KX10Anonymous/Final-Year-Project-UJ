package com.janonimo.nexus.dto.management;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability {
    private LocalDateTime start;
    private LocalDateTime end;
}
