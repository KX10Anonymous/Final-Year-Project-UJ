package com.janonimo.nexus.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class ContactValidationResponse {
    @JsonProperty("exists")
    private boolean exists;
}
