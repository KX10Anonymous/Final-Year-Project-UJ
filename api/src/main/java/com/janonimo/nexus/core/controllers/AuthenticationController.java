package com.janonimo.nexus.core.controllers;

import com.janonimo.nexus.app.authentication.AuthenticationService;
import com.janonimo.nexus.dto.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register/{device}")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request, @PathVariable String device) {
        AuthenticationResponse response = authenticationService.register(request, device);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } else {
            return ResponseEntity.ok(response);
        }
    }

    @PutMapping("/password/{jwt}")
    public ResponseEntity<AuthenticationResponse> changePassword(@PathVariable String jwt, PasswordRequest request){
        return new ResponseEntity<>(authenticationService.changePassword(jwt,request, "BROWSER"), HttpStatus.OK);
    }

    @PostMapping("/login/{device}")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody LoginRequest request, @PathVariable String device) {
        AuthenticationResponse login = authenticationService.login(request, device);
        if (login != null) {
            if(!login.getJwt().isEmpty()){
                return ResponseEntity.ok(login);
            }else{
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        } else{
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PutMapping("/refresh-token/{refreshToken}")
    public ResponseEntity<AuthenticationResponse> refreshToken(@PathVariable String refreshToken, @RequestBody LogoutRequest request) {
        return new ResponseEntity<>(authenticationService.refreshToken(refreshToken, request.getDevice()), HttpStatus.OK);
    }

    @GetMapping("/logout/{jwt}")
    public ResponseEntity<Boolean> logout(@PathVariable String jwt){
        return new ResponseEntity<>(authenticationService.revokeToken(jwt), HttpStatus.OK);
    }


}
