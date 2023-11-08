package com.janonimo.nexus.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class StaffDto {
    private int id;
    private String fullname;
    private String role;
    private String email;
    private String phone;
    private LocalDateTime access;
}
