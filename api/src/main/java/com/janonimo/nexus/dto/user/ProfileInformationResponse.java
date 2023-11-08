package com.janonimo.nexus.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileInformationResponse {
    @JsonProperty("firstname")
    private String firstname;
    @JsonProperty("surname")
    private String surname;
    @JsonProperty("email")
    private String email;
    @JsonProperty("role")
    private String role;
    private String phone;
}
