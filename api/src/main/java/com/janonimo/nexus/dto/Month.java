package com.janonimo.nexus.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Month {
    private LocalDateTime month;
}
