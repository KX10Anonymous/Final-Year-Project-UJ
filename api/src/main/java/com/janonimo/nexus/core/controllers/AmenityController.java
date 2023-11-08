package com.janonimo.nexus.core.controllers;

import com.janonimo.nexus.core.models.Amenity;
import com.janonimo.nexus.core.services.AmenityService;
import com.janonimo.nexus.dto.Reference;
import com.janonimo.nexus.dto.management.AmenityDto;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amenities")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AmenityController {
    private final AmenityService amenityService;
    private final RequestHandler requestHandler;

    @PostMapping("/create/{jwt}")
    public ResponseEntity<AmenityDto> create(@PathVariable String jwt, @RequestBody AmenityDto request){
        if(requestHandler.isManagement(jwt)){
            Amenity result = amenityService.create(request);
            if(result != null){
                return new ResponseEntity<>(new AmenityDto(result), HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/edit/{jwt}")
    public ResponseEntity<AmenityDto> edit(@PathVariable String jwt, @RequestBody AmenityDto request){
        if(requestHandler.isOwner(jwt) || requestHandler.isManager(jwt)){
            Amenity result = amenityService.create(request);
            if(result != null){
                return new ResponseEntity<>(new AmenityDto(result), HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/all/{jwt}")
    public ResponseEntity<List<AmenityDto>> all(@PathVariable String jwt){
        if(requestHandler.isManagement(jwt)){
            List<AmenityDto> response = amenityService.amenities();
            if(response != null){
                return new ResponseEntity<>(response, HttpStatus.OK);
            }else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/names")
    public ResponseEntity<List<String>> names(){
       List<String> response = amenityService.names();
       if(!response.isEmpty()){
           return new ResponseEntity<>(response, HttpStatus.OK);
       }else {
           return  new ResponseEntity<>(HttpStatus.NO_CONTENT);
       }
    }

    @DeleteMapping("/delete/{jwt}")
    public ResponseEntity<Boolean> delete(@PathVariable String jwt, @RequestBody Reference reference){
        if(requestHandler.isManagement(jwt)){
            return new ResponseEntity<>(amenityService.delete(reference.getId()), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
