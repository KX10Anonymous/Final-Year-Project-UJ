package com.janonimo.nexus.app.authentication;

import com.janonimo.nexus.app.authentication.token.DeviceType;
import com.janonimo.nexus.app.authentication.token.Token;
import com.janonimo.nexus.app.authentication.token.TokenRepository;
import com.janonimo.nexus.app.authentication.token.TokenType;
import com.janonimo.nexus.app.config.JwtService;
import com.janonimo.nexus.dto.user.*;
import com.janonimo.nexus.user.LockStatus;
import com.janonimo.nexus.user.Role;
import com.janonimo.nexus.user.User;
import com.janonimo.nexus.user.services.RoleRepository;
import com.janonimo.nexus.user.services.UserRepository;
import com.janonimo.nexus.user.services.UserService;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

@SuppressWarnings("ALL")
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService tokenService;
    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;
    private final RequestHandler requestHandler;
    private final UserService userService;

    public AuthenticationResponse register(RegisterRequest request, String device) {
        try {
            if (!userService.emailExists(request.getEmail())) {
                Role role = roleRepository.findGuest().get();
                User user = User.builder()
                        .firstname(request.getFirstname())
                        .lastname(request.getLastname())
                        .email(request.getEmail())
                        .role(role)
                        .phone(request.getPhone())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .lockStatus(LockStatus.ACTIVE)
                        .build();
                user = repository.save(user);
                if (user != null) {
                    if (repository.existsById(user.getId())) {
                        LoginRequest loginRequest = LoginRequest.builder().password(request.getPassword()).email(request.getEmail()).build();
                        return login(loginRequest, device);
                    }
                }
            }
            return null;

        } catch (BadCredentialsException ex) {
            return null;
        }

    }

    public User read(String jwt) {
        try {
            if (tokenRepository.findByToken(jwt).isPresent()) {
                Token token = Objects.requireNonNull(tokenRepository.findByToken(jwt)).orElse(null);
                if (token != null) {
                    if (Objects.requireNonNull(repository.findById(token.getUser().getId())).isPresent()) {
                        User user = Objects.requireNonNull(repository.findById(token.user.getId())).orElse(null);
                        if (user != null) {
                            user.setPassword("");
                        }
                        return user;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (NullPointerException e) {
            return null;
        }

    }

    public AuthenticationResponse login(LoginRequest request, String device) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
            User user = repository.findByEmail(request.getEmail()).orElse(null);
            if (user.getLockStatus() != LockStatus.LOCKED) {
                return authenticated(user, device);
            } else {
                return null;
            }

        } catch (BadCredentialsException ex) {
            return empty();
        }
    }

    public AuthenticationResponse changePassword(String jwt, PasswordRequest request, String device) {
        User user = requestHandler.getUser(jwt);
        AuthenticationResponse loginResponse = null;
        if (user != null) {
            if (request.getReplacement().compareTo(request.getConfirmation()) == 0) {
                if (request.getReplacement().compareTo(request.getOld()) != 0) {
                    if (passwordEncoder.encode(request.getOld()).compareTo(user.getPassword()) == 0) {
                        user.setPassword(passwordEncoder.encode(request.getReplacement()));
                        user = userService.save(user);
                        if (user != null) {
                            LoginRequest loginRequest = LoginRequest.builder()
                                    .password(request.getReplacement()).email(user.getEmail()).build();
                            loginResponse = login(loginRequest, device);
                        }
                    }
                }
            }
        }
        return loginResponse;
    }

    private void saveUserToken(User user, String jwt, DeviceType deviceType) {
        var token = Token.builder()
                .user(user)
                .token(jwt)
                .stamp(LocalDateTime.now())
                .device(DeviceType.BROWSER)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    public void revokeToken(String jwt, LogoutRequest request) {
        Token token = tokenRepository.findByDeviceToken(request.getDevice(), jwt).orElse(null);
        if (token != null) {
            token.setExpired(true);
            token.setRevoked(true);
            tokenRepository.save(token);
        }
    }

    private DeviceType getDevice(String device) {
        if (device.equalsIgnoreCase("BROWSER")) {
            return DeviceType.BROWSER;
        } else {
            return DeviceType.MOBILE_APP;
        }
    }

    public boolean revokeToken(String jwt) {
        Token token = tokenRepository.findByToken(jwt).orElse(null);
        if (token != null) {
            token.setExpired(true);
            token.setRevoked(true);
            tokenRepository.save(token);
        }
        return token.revoked;
    }

    private void revokeTokens(User user, String device) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (!validUserTokens.isEmpty()) {
            validUserTokens.forEach(token -> {
                token.setExpired(true);
                token.setRevoked(true);
            });
            tokenRepository.saveAll(validUserTokens);
        }
    }

    public AuthenticationResponse refreshToken(String refreshToken, String device) {
        AuthenticationResponse response = null;
        String userEmail = tokenService.extractUsername(refreshToken);
        if (userEmail != null) {
            User user = repository.findByEmail(userEmail).orElse(null);
            if (user != null) {
                if (tokenService.isTokenValid(refreshToken, user)) {
                    revokeTokens(user, device);
                    String accessToken = tokenService.generateToken(user);
                    saveUserToken(user, accessToken, getDevice(device));
                    response = AuthenticationResponse.builder().jwt(accessToken)
                            .refresh(refreshToken)
                            .role(user.getRole().getRoleName().name())
                            .fullname(user.fullName())
                            .build();
                }
            }
        }
        return response;
    }

    public void handleEmptyResponse(String email, AuthenticationResponse response) {
        if (userService.emailExists(email)) {
            User user = userService.findByEmail(email);
            if (user != null) {
                requestHandler.handleAccountLock(user, response);
            }
        }
    }


    public AuthenticationResponse empty() {
        return new AuthenticationResponse("", "", "", "", "");
    }

    public AuthenticationResponse authenticated(User user, String device) {
        if (user != null) {
            revokeTokens(user, device);
            String newToken = tokenService.generateToken(user);
            String refreshToken = tokenService.generateRefreshToken(user);
            user.setStamp(LocalDateTime.now());
            user = repository.save(user);

            if (user != null) {
                if (user.getLockStatus() != LockStatus.LOCKED) {
                    DeviceType dev = getDevice(device);
                    saveUserToken(user, newToken, dev);
                    String main = user.getRole().getRoleName().name();

                    return AuthenticationResponse.builder()
                            .jwt(newToken)
                            .refresh(refreshToken)
                            .role(main)
                            .fullname(user.fullName())
                            .status("ACTIVE")
                            .build();
                }
            }
        }
        return empty();
    }
}
