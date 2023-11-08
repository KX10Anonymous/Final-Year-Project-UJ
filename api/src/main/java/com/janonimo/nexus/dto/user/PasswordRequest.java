package com.janonimo.nexus.dto.user;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordRequest {
    private String old;
    private String replacement;
    private String confirmation;
}
