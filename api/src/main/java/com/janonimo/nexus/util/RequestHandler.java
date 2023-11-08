package com.janonimo.nexus.util;

import com.janonimo.nexus.app.authentication.token.Token;
import com.janonimo.nexus.app.authentication.token.TokenRepository;
import com.janonimo.nexus.dto.user.AuthenticationResponse;
import com.janonimo.nexus.user.LockStatus;
import com.janonimo.nexus.user.RoleName;
import com.janonimo.nexus.user.User;
import com.janonimo.nexus.user.services.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RequestHandler {
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    public  boolean validateUserRequest(String jwt){
        Token temp = tokenRepository.findByToken(jwt).orElse(null);
        if(Objects.equals(temp, null))
            return false;
        return !temp.isExpired() && !temp.isRevoked();
    }

    public User getLoggedUserInstance(String jwt){
       if(validateUserRequest(jwt)){
           return Objects.requireNonNull(tokenRepository.findByToken(jwt).orElse(null)).getUser();
       }
       return null;
    }

    public  User getUser(String jwt){
        if(validateUserRequest(jwt)){
            return Objects.requireNonNull(tokenRepository.findByToken(jwt).orElseThrow(null)).getUser();
        }
        return null;
    }

    public void handleAccountLock(User user, AuthenticationResponse response){
        if(user.isAccountNonLocked()){
            if(isAuthEmpty(response)){
                if(user.getLockStatus() == LockStatus.ACTIVE){
                    user.setLockStatus(LockStatus.FIRST_ATTEMPT);
                }else if(user.getLockStatus() == LockStatus.FIRST_ATTEMPT){
                    user.setLockStatus(LockStatus.SECOND_ATTEMPT);
                }else if(user.getLockStatus() == LockStatus.SECOND_ATTEMPT){
                    user.setLockStatus(LockStatus.THIRD_ATTEMPT);
                }else{
                    user.setLockStatus(LockStatus.LOCKED);
                }
                userRepository.save(user);
            }else{
                if(user.getLockStatus() != LockStatus.ACTIVE){
                    user.setLockStatus(LockStatus.ACTIVE);
                    userRepository.save(user);
                }
            }
        }
    }

    public boolean isAuthEmpty(AuthenticationResponse response){
        return response == null;
    }

    public boolean isGuest(String jwt){
        if(validateUserRequest(jwt)){
            User user = getLoggedUserInstance(jwt);
            return user.getRole().getRoleName() == RoleName.GUEST;
        }
        return false;
    }

    public boolean isClerk(String jwt){
        if(validateUserRequest(jwt)){
            User user = getLoggedUserInstance(jwt);
            return user.getRole().getRoleName() == RoleName.CLERK;
        }
        return false;
    }

    public boolean isManager(String jwt){
        if(validateUserRequest(jwt)){
            User user = getLoggedUserInstance(jwt);
            return user.getRole().getRoleName() == RoleName.MANAGER;
        }
        return false;
    }

    public boolean isOwner(String jwt){
        if(validateUserRequest(jwt)){
            User user = getLoggedUserInstance(jwt);
            return user.getRole().getRoleName() == RoleName.OWNER;
        }
        return false;
    }

    public boolean isManagement(String jwt){
        return (isManager(jwt) || isClerk(jwt) || isOwner(jwt));
    }
}