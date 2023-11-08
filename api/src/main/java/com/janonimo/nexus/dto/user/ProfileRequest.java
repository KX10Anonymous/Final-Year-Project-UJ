package com.janonimo.nexus.dto.user;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileRequest {
    private String email;
    private String phone;
}
