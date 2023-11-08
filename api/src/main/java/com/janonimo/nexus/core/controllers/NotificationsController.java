package com.janonimo.nexus.core.controllers;

import com.janonimo.nexus.core.communication.services.NotificationsService;
import com.janonimo.nexus.dto.Reference;
import com.janonimo.nexus.dto.user.NotificationResponse;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class NotificationsController {
    private final NotificationsService notificationsService;
    private final RequestHandler requestHandler;

    @PutMapping("/update/{jwt}")
    public ResponseEntity<List<NotificationResponse>> update(@PathVariable String jwt, @RequestBody Reference reference){
       if(requestHandler.validateUserRequest(jwt)){
           notificationsService.update(reference.getId());
           List<NotificationResponse> response = notificationsService.notifications(jwt);
           if(response != null){
               return new ResponseEntity<>(response, HttpStatus.OK);
           }else{
               return new ResponseEntity<>(HttpStatus.NO_CONTENT);
           }
       }
       return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/all/{jwt}")
    public ResponseEntity<List<NotificationResponse>> all(@PathVariable String jwt){
        if(requestHandler.validateUserRequest(jwt)){
            List<NotificationResponse> response = notificationsService.notifications(jwt);
            if(response != null){
                return new ResponseEntity<>(response, HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
