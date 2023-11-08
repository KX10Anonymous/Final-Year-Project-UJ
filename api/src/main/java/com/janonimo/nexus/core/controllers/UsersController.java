
package com.janonimo.nexus.core.controllers;

import com.janonimo.nexus.app.authentication.AuthenticationService;
import com.janonimo.nexus.app.authentication.token.Token;
import com.janonimo.nexus.app.authentication.token.TokenRepository;
import com.janonimo.nexus.dto.Reference;
import com.janonimo.nexus.dto.Search;
import com.janonimo.nexus.dto.management.GuestDto;
import com.janonimo.nexus.dto.user.ContactValidationResponse;
import com.janonimo.nexus.dto.user.ProfileInformationResponse;
import com.janonimo.nexus.dto.user.RegisterRequest;
import com.janonimo.nexus.dto.user.StaffDto;
import com.janonimo.nexus.user.User;
import com.janonimo.nexus.user.services.UserService;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 *
 * @author JANONIMO
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class UsersController {
    private final AuthenticationService authService;
    private final TokenRepository tokenRepository;
    private final UserService userService;
    private final RequestHandler requestHandler;
    @GetMapping("/user/{jwt}")
    public ResponseEntity<User> read(@PathVariable String jwt){
        return new ResponseEntity<>(authService.read(jwt), HttpStatus.OK);
    }


    @PostMapping("/edit/{jwt}")
    public ResponseEntity<User> edit(@PathVariable String jwt,@RequestBody User user){
        Token token = tokenRepository.findByToken(jwt).orElse(null);
        if(token != null){
            if(!token.isExpired()){
                return new ResponseEntity<>(userService.save(user), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }


    @GetMapping("/email-check/{email}")
    public ResponseEntity<ContactValidationResponse> emailExists(@PathVariable String email){
        ContactValidationResponse response = ContactValidationResponse.builder()
                .exists(userService.emailExists(email)).build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/guests/{jwt}")
    public ResponseEntity<List<GuestDto>> guests(@PathVariable String jwt){
        if(requestHandler.isManagement(jwt)){
            List<GuestDto> response = userService.checkedInGuests();
            if(response != null){
                return new ResponseEntity<>(response, HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/phone-check/{phone}")
    public ResponseEntity<ContactValidationResponse> phoneExists(@PathVariable String phone){
        ContactValidationResponse response = ContactValidationResponse.builder()
                .exists(userService.phoneExists(phone)).build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/profile/{jwt}")
    public ResponseEntity<ProfileInformationResponse> profile(@PathVariable String jwt){
        if(requestHandler.validateUserRequest(jwt)){
            ProfileInformationResponse response = userService.profile(jwt);
            if(response != null){
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/staff/{jwt}")
    public ResponseEntity<List<StaffDto>> staff(@PathVariable String jwt){
        if(requestHandler.isManagement(jwt)){
            return new ResponseEntity<>(userService.staff(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/register/{jwt}")
    public ResponseEntity<Boolean> register(@PathVariable String jwt, @RequestBody RegisterRequest request){
        if(requestHandler.isOwner(jwt) || requestHandler.isManager(jwt)){
            return new ResponseEntity<>(userService.register(request), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/delete/{jwt}")
    public ResponseEntity<Boolean> delete(@PathVariable String jwt, @RequestBody Reference reference){
        if(requestHandler.isOwner(jwt)){
            return new ResponseEntity<>(userService.delete(reference), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/deactivate/{jwt}")
    public ResponseEntity<Boolean> deactivate(@PathVariable String jwt, @RequestBody Reference reference){
        if(requestHandler.isManagement(jwt)){
            return new ResponseEntity<>(userService.deactivate(reference.getId()), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/activate/{jwt}")
    public ResponseEntity<Boolean> activate(@PathVariable String jwt, @RequestBody Reference reference){
        if(requestHandler.isManagement(jwt)){
            return new ResponseEntity<>(userService.activate(reference.getId()), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/check-clash/{jwt}")
    public ResponseEntity<Boolean>  bookingClash(@PathVariable String jwt, @RequestBody Search search){
        return new ResponseEntity<>(userService.bookingConflict(jwt, search), HttpStatus.OK);
    }

}
