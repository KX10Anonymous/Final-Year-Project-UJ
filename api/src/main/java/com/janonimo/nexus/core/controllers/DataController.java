package com.janonimo.nexus.core.controllers;

import com.janonimo.nexus.core.services.BookingService;
import com.janonimo.nexus.core.services.DataService;
import com.janonimo.nexus.core.services.TransactionsService;
import com.janonimo.nexus.dto.management.GuestDto;
import com.janonimo.nexus.dto.management.reports.*;
import com.janonimo.nexus.user.services.UserService;
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
@RequestMapping("/api/data")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RequiredArgsConstructor
public class DataController {
    private final RequestHandler requestHandler;
    private final DataService dataService;
    private final TransactionsService transactionsService;
    private final UserService userService;
    private final BookingService bookingService;

    @GetMapping("/invoices/{jwt}")
    public ResponseEntity<List<InvoiceReport>> invoices(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            List<InvoiceReport> response = dataService.invoiceReports();
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/popularity/{jwt}")
    public ResponseEntity<RoomPopularity> popularity(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            RoomPopularity response = dataService.popularity();
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("registrationConversion/{jwt}")
    public ResponseEntity<Double> registrationConversion(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            return new ResponseEntity<>(userService.conversionRate(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("bookingConversion/{jwt}")
    public ResponseEntity<Double> bookingConversion(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            return new ResponseEntity<>(bookingService.conversionRate(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/seasonality/{jwt}")
    public ResponseEntity<Seasonality> seasonality(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            Seasonality response = dataService.seasonality();
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/annual/{year}")
    public ResponseEntity<AnnualDto> annual(@PathVariable int year) {
        AnnualDto response = dataService.annualPerformance(year);
        if (response != null) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @GetMapping("/transactions/{jwt}")
    public ResponseEntity<TransactionsDto> transactions(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            TransactionsDto response = transactionsService.breakdown();
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/guests/{jwt}")
    public ResponseEntity<List<GuestDto>> guests(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            List<GuestDto> response = userService.toGuestDtoList();
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/rooms/{jwt}")
    public ResponseEntity<List<RoomManagement>> rooms(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            List<RoomManagement> response = dataService.rooms();
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/popularitySummary/{jwt}")
    public ResponseEntity<SummaryDto> popularitySummary(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            SummaryDto response = dataService.popularitySummary();
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/seasonalitySummary/{jwt}")
    public ResponseEntity<SummaryDto> seasonalitySummary(@PathVariable String jwt) {
        if (requestHandler.isManagement(jwt)) {
            SummaryDto response = dataService.seasonalitySummary();
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/download-spreadsheet")
    public ResponseEntity<Resource> downloadInvoice() {
        String fileName = dataService.generateSpreadsheet();
        String filePath = "C:/Users/ronni/Documents/MINI PROJECT/api/src/main/resources/utilities/"+fileName;
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
        if (fileName.endsWith(".xlsx")) {
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        } else {
            return "application/octet-stream";
        }
    }
}
