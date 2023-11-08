package com.janonimo.nexus.core.controllers;

import com.janonimo.nexus.core.services.BookingService;
import com.janonimo.nexus.dto.Reference;
import com.janonimo.nexus.dto.management.BookingDto;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class BookingsController {
    private final RequestHandler requestHandler;
    private final BookingService bookingService;

    @PostMapping("/create/{jwt}")
    public ResponseEntity<BookingDto> create(@PathVariable String jwt, @RequestBody BookingDto request){
        if(requestHandler.isGuest(jwt)){
            System.out.println("Running Create");
            BookingDto response = bookingService.create(jwt, request);
            if(response != null){
                return new ResponseEntity<>(response, HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/edit/{jwt}")
    public ResponseEntity<BookingDto> edit(@PathVariable String jwt, @RequestBody BookingDto request){
        if(requestHandler.isGuest(jwt)  ||requestHandler.isManager(jwt)|| requestHandler.isClerk(jwt)){
            BookingDto response = bookingService.edit(request);
            if(response != null){
                return new ResponseEntity<>(response, HttpStatus.OK);
            }else {
                return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/delete/{jwt}")
    public ResponseEntity<Boolean> delete(@PathVariable String jwt, @RequestBody Reference reference){
        if(requestHandler.isGuest(jwt) ||requestHandler.isManager(jwt) || requestHandler.isClerk(jwt)){
            return new ResponseEntity<>(bookingService.delete(jwt, reference), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    private ResponseEntity<List<BookingDto>> bookingUtility(List<BookingDto> response){
        if(response != null){
            return new ResponseEntity<>(response, HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @GetMapping("/bookings/{jwt}")
    public ResponseEntity<List<BookingDto>> bookings(@PathVariable String jwt){
        if(requestHandler.isClerk(jwt) || requestHandler.isOwner(jwt) || requestHandler.isManager(jwt)){
           return bookingUtility(bookingService.getBookings());
        } else if (requestHandler.isGuest(jwt)) {
            return bookingUtility(bookingService.userBookings(jwt));
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/room/{jwt}")
    public ResponseEntity<List<BookingDto>> roomBookings(@PathVariable String jwt, @RequestBody Reference reference){
        if(requestHandler.isOwner(jwt) || requestHandler.isManager(jwt)){
            return bookingUtility(bookingService.roomBookings(reference.getId()));
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/confirmation/{bookingId}")
    public ResponseEntity<Boolean> confirmation(@PathVariable int bookingId){
        return new ResponseEntity<>(bookingService.hasBooking(bookingId), HttpStatus.OK);
    }

    @GetMapping("/date/{id}")
    public ResponseEntity<Boolean> isBookingDate(@PathVariable int id){
        return new ResponseEntity<>(bookingService.isBookingDateArrived(id), HttpStatus.OK);
    }

    @PutMapping("/checkin/{jwt}")
    public ResponseEntity<BookingDto> checkin(@PathVariable String jwt, @RequestBody Reference reference){
        if(requestHandler.isClerk(jwt) || requestHandler.isManager(jwt)){
            BookingDto response = bookingService.checkin(reference);
            if(response != null){
                return new ResponseEntity<>(response, HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/checkout/{jwt}")
    public ResponseEntity<BookingDto> checkout(@PathVariable String jwt, @RequestBody Reference reference){
        if(requestHandler.isClerk(jwt) || requestHandler.isManager(jwt)){
            BookingDto response = bookingService.checkout(reference);
            if(response != null){
                return new ResponseEntity<>(response, HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
