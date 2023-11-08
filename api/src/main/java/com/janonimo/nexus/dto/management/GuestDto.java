package com.janonimo.nexus.dto.management;

import com.janonimo.nexus.user.LockStatus;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@RequiredArgsConstructor
@Data
@AllArgsConstructor
public class GuestDto {
    private int id;
    private String roomNumber;
    private LockStatus status;
    private String type;
    private String guest;
    private int bookingId;
    private LocalDateTime checkout;
    private String phone;
    private String email;
    private int visits;
}
