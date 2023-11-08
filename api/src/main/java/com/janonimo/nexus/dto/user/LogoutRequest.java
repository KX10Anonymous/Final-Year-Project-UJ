package com.janonimo.nexus.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@AllArgsConstructor
@Data
public class LogoutRequest {
    private String device;
}
