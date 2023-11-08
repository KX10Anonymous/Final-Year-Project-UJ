package com.janonimo.nexus.core.controllers;

import com.janonimo.nexus.core.models.Booking;
import com.janonimo.nexus.core.models.billing.Invoice;
import com.janonimo.nexus.core.services.BookingService;
import com.janonimo.nexus.core.services.ReservationService;
import com.janonimo.nexus.dto.Reference;
import com.janonimo.nexus.dto.management.Generic;
import com.janonimo.nexus.dto.management.billing.InvoiceDto;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class InvoicesController {
    private final RequestHandler requestHandler;
    private final ReservationService reservationService;
    private final BookingService bookingService;

    @PutMapping("/create/{jwt}")
    public ResponseEntity<InvoiceDto> invoice(@PathVariable String jwt, @RequestBody Reference reference) {
        if (requestHandler.isClerk(jwt) || requestHandler.isManager(jwt)) {
            InvoiceDto response = reservationService.invoice(reference.getId());
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/read/{jwt}")
    public ResponseEntity<InvoiceDto> read(@PathVariable String jwt, @RequestBody Reference reference) {
        if (requestHandler.isClerk(jwt) || requestHandler.isGuest(jwt) || requestHandler.isManager(jwt)) {
            Booking booking = bookingService.findByInvoice(reference.getId());
            if (booking != null) {
                return new ResponseEntity<>(reservationService.invoice(reference.getId()), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/pay/{jwt}")
    public ResponseEntity<Boolean> pay(@PathVariable String jwt, @RequestBody Reference reference) {
        if (requestHandler.isGuest(jwt)) {
            reservationService.pay(reference.getId(), jwt);
            return new ResponseEntity<>(true, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/all/{jwt}")
    public ResponseEntity<List<InvoiceDto>> invoices(@PathVariable String jwt) {
        if (requestHandler.isGuest(jwt)) {
            List<InvoiceDto> response = reservationService.readUserInvoices(jwt);
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/pdf/{id}")
    public ResponseEntity<Generic> generatePdf(@PathVariable int id) {
        Booking booking = bookingService.read(id);
        if (booking != null) {
            Invoice invoice = booking.getInvoice();
            if (invoice != null) {
                String name = reservationService.generateInvoicePdf(invoice.getId());
                if (name != null) {
                    Generic generic = new Generic();
                    generic.setFile(name);
                    return ResponseEntity.ok(generic);
                }
            }
        }
        return ResponseEntity.ok(null);
    }

    @GetMapping("/regenerate/{id}")
    public ResponseEntity<String> regeneratePdf(@PathVariable int id) {
        String name = reservationService.generateInvoicePdf(id);
        return ResponseEntity.ok(Objects.requireNonNullElse(name, ""));
    }

    @GetMapping("/download/{download}")
    public ResponseEntity<Resource> downloadInvoice(@PathVariable String download) {
        String folderName = "C:/Users/ronni/Documents/MINI PROJECT/api/src/main/resources/invoices/";
        String filePath = folderName + download;


        Path path = Paths.get(filePath);
        Resource resource;
        try {
            resource = new ByteArrayResource(Files.readAllBytes(path));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        String contentType = getContetType(filePath);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDispositionFormData("attachment", filePath);

        return Objects.requireNonNull(ResponseEntity.ok()
                        .headers(headers))
                .body(resource);
    }

    private String getContetType(String fileName) {
        if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        } else {
            return "application/octet-stream";
        }
    }
}


