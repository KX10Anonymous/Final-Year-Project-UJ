package com.janonimo.nexus.core.controllers;

import com.janonimo.nexus.core.models.Room;
import com.janonimo.nexus.core.services.RoomsService;
import com.janonimo.nexus.dto.Month;
import com.janonimo.nexus.dto.Reference;
import com.janonimo.nexus.dto.Search;
import com.janonimo.nexus.dto.management.RoomAmenity;
import com.janonimo.nexus.dto.management.RoomDto;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class RoomsController {
    private final RoomsService roomService;
    private final RequestHandler requestHandler;

    @PostMapping("/upload/{id}")
    public ResponseEntity<?> upload(@PathVariable int id, @RequestBody MultipartFile file) {
        roomService.upload(id, file);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/read/{id}")
    public ResponseEntity<RoomDto> read(@PathVariable int id) {
        RoomDto response = roomService.read(id);
        if (response != null) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @PostMapping("/search")
    public ResponseEntity<List<RoomDto>> search(@RequestBody Search search) {
        List<RoomDto> response = roomService.available(search);
        if (response != null) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @PostMapping("/confirmation/{id}")
    public ResponseEntity<Boolean> confirmation(@RequestBody Search search, @PathVariable int id) {
        Room room = roomService.room(id);
        if (room != null) {
            Boolean response = roomService.isRoomAvailable(room, search);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @PutMapping("/availability/{id}")
    public ResponseEntity<List<Integer>> availability(@PathVariable int id, @RequestBody Month mo) {
        System.out.println("Month Checking " +mo.getMonth().getYear());
        List<Integer> response = roomService.availability(id, mo);
        if (response != null) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomDto>> rooms() {
        List<RoomDto> response = roomService.rooms();
        if (response != null) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }


    @DeleteMapping("/delete/{jwt}")
    public ResponseEntity<Boolean> delete(@PathVariable String jwt, @RequestBody Reference reference) {
        return new ResponseEntity<>(roomService.delete(jwt, reference), HttpStatus.OK);
    }

    @PostMapping("/create/{jwt}")
    public ResponseEntity<?> create(@PathVariable String jwt, @RequestBody RoomDto request) {
        if ((requestHandler.isOwner(jwt))) {
            RoomDto response = roomService.create(request);
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/edit/{jwt}")
    public ResponseEntity<?> edit(@PathVariable String jwt, @RequestBody RoomDto request) {
        if ((requestHandler.isOwner(jwt))) {
            RoomDto response = roomService.edit(request);
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/management/{jwt}")
    public ResponseEntity<RoomDto> management(@PathVariable String jwt, @RequestBody Reference reference) {
        if (requestHandler.isClerk(jwt) || requestHandler.isManager(jwt)) {
            RoomDto response = roomService.roomManagement(reference.getId());
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> types() {
        List<String> response = roomService.types();
        if (response != null) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @PutMapping("/addAmenity/{jwt}")
    public ResponseEntity<Boolean> addAmenity(@PathVariable String jwt, @RequestBody RoomAmenity request) {
        if (requestHandler.isManagement(jwt)) {
            return new ResponseEntity<>(roomService.addAmenity(request), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/deleteAmenity/{jwt}")
    public ResponseEntity<Boolean> deleteAmenity(@PathVariable String jwt, @RequestBody RoomAmenity request) {
        if (requestHandler.isManagement(jwt)) {
            return new ResponseEntity<>(roomService.removeRoomAmenity(request), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/additional_amenities/{jwt}")
    public ResponseEntity<List<String>> amenitiesToAdd(@PathVariable String jwt, @RequestBody RoomAmenity request) {
        if (requestHandler.isManagement(jwt)) {
            return new ResponseEntity<>(roomService.roomNoneAmenities(request.getRoomId()), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/src/{src}")
    public ResponseEntity<byte[]> roomPhoto(@PathVariable String src) throws IOException {
        File file = new File("C:/Users/JANONIMO/Documents/MINI PROJECT/MiniProject8/web/public/src/"+src);
        if (file.exists()) {
            System.out.println("FOUND");
            byte[] srcBytes = Files.readAllBytes(file.toPath());
            return Objects.requireNonNull(ResponseEntity.ok()
                            .contentType(MediaType.IMAGE_JPEG))
                    .body(srcBytes);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/room-number-check/{roomNumber}")
    public ResponseEntity<Boolean> emailExists(@PathVariable String roomNumber){
        return new ResponseEntity<>(roomService.checkRoomNumber(roomNumber), HttpStatus.OK);
    }
}
