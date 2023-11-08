package com.janonimo.nexus.core.services;

import com.janonimo.nexus.core.models.Amenity;
import com.janonimo.nexus.core.models.Booking;
import com.janonimo.nexus.core.models.Room;
import com.janonimo.nexus.core.models.billing.Invoice;
import com.janonimo.nexus.core.repositories.AmenityRepository;
import com.janonimo.nexus.core.repositories.BookingRepository;
import com.janonimo.nexus.core.repositories.InvoiceRepository;
import com.janonimo.nexus.core.repositories.RoomRepository;
import com.janonimo.nexus.dto.management.reports.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Month;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DataService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final InvoiceRepository invoiceRepository;
    private final AmenityRepository amenityRepository;

    public List<InvoiceReport> invoiceReports() {
        List<Invoice> bookings = invoiceRepository.paid();
        List<InvoiceReport> reports = null;
        if (bookings != null) {
            reports = new ArrayList<>();
            for (Invoice invoice : bookings) {
                reports.add(new InvoiceReport(invoice));
            }
        }
        return reports;
    }

    public RoomPopularity popularity() {
        List<Room> rooms = roomRepository.findAll();
        RoomPopularity roomPopularity = new RoomPopularity();
        HashMap<String, Integer> hash = getHashMap();
        if (rooms != null) {
            for (Room room : rooms) {
                if (!hash.containsKey(room.getType())) {
                    int visits = bookingRepository.processedBookings(room.getType()).size();
                    hash.put(getRoomName(room.getType()), visits);
                }
            }
            if (!hash.isEmpty()) {
                roomPopularity.setVisits(new ArrayList<>(hash.values()));
                roomPopularity.setType(new ArrayList<>(hash.keySet()));
            }
        }
        return roomPopularity;
    }

    private HashMap<String, Integer> getHashMap() {
        return new HashMap<>();
    }

    public Seasonality seasonality() {
        Seasonality seasonality = null;
        List<Booking> bookings = bookingRepository.processedBookings();

        if (bookings != null && !bookings.isEmpty()) {
            Map<String, Integer> hash = new TreeMap<>();

            for (Booking booking : bookings) {
                String monthName = booking.getCheckout().getMonth().name();
                hash.put(monthName, hash.getOrDefault(monthName, 0) + 1);
            }

            List<String> sorted = new ArrayList<>();
            List<Integer> stats = new ArrayList<>();

            for (int c = 1; c <= 12; c++) {
                Month month = Month.of(c);
                String monthName = month.toString();
                if (hash.containsKey(monthName)) {
                    sorted.add(getMonthName(monthName));
                    stats.add(hash.get(monthName));
                }
            }
            seasonality = new Seasonality();
            seasonality.setMonths(sorted);
            seasonality.setStats(stats);
        }
        return seasonality;
    }

    private String getMonthName(String month){
        return month.substring(0,3).toUpperCase();
    }


    private String getRoomName(String room){

        if(room.contains(" ")){
            int spaceIndex = room.indexOf(' ');
            return room.substring(0, spaceIndex).toUpperCase();
        }else {
            return room.toUpperCase();
        }
    }

    public SummaryDto seasonalitySummary() {
        SummaryDto summaryDto = null;
        List<Booking> bookings = bookingRepository.processedBookings();

        if (bookings != null && !bookings.isEmpty()) {
            Map<Integer, Integer> monthsNum = new HashMap<>();
            for (Booking book : bookings) {
                int monthValue = book.getCheckout().getMonthValue();
                monthsNum.put(monthValue, monthsNum.getOrDefault(monthValue, 0) + 1);
            }

            int maxVisits = Collections.max(monthsNum.values());
            for (Map.Entry<Integer, Integer> entry : monthsNum.entrySet()) {
                if (entry.getValue() == maxVisits) {
                    Month mostVisitedMonth = Month.of(entry.getKey());
                    summaryDto = SummaryDto.builder()
                            .title(mostVisitedMonth.toString())
                            .visits(maxVisits)
                            .build();
                    break;
                }
            }
        }

        return summaryDto;
    }

    public SummaryDto popularitySummary() {
        SummaryDto summaryDto = null;
        List<Room> rooms = roomRepository.findAll();
        HashMap<String, Integer> hash = getHashMap();
        if (rooms != null) {
            String initial = rooms.get(0).getType();
            for (Room room : rooms) {
                if (!hash.containsKey(room.getType())) {
                    int visits = bookingRepository.processedBookings(room.getType()).size();
                    hash.put(room.getType(), visits);
                }
            }

            int max = hash.get(initial);
            summaryDto = SummaryDto.builder().title(initial).visits(max).build();
            for (String room : hash.keySet()) {
                int visits = hash.get(room);
                if (visits > max) {
                    max = visits;
                    summaryDto = SummaryDto.builder().title(room).visits(max).build();
                }
            }
        }
        return summaryDto;
    }

    public List<RoomManagement> rooms() {
        List<RoomManagement> dto = null;
        List<Room> rooms = roomRepository.findAll();
        if (rooms != null) {
            dto = new ArrayList<>();
            for (Room room : rooms) {
                int numBookings = bookingRepository.findRoomBookings(room.getId()).size();
                List<Booking> bookings = bookingRepository.roomVisits(room.getId());
                int visits = bookings.size();
                List<String> amenitiesStrs = new ArrayList<>();
                List<Amenity> roomAmenities = room.getAmenities();
                if (roomAmenities != null) {
                    for (Amenity amenity : roomAmenities) {
                        amenitiesStrs.add(amenity.getDescription());
                    }
                }

                List<String> additionalStrs = new ArrayList<>();
                List<Amenity> allAmenities = amenityRepository.findAll();
                if (allAmenities != null && roomAmenities != null) {
                    for (Amenity amenity : allAmenities) {
                        if (!roomAmenities.contains(amenity)) {
                            additionalStrs.add(amenity.getDescription());
                        }
                    }
                }
                double revenue = 0.0;
                for (Booking booking : bookings) {
                    revenue += booking.getTotalRate();
                }
                int currentBookings = bookingRepository.roomBookings(room.getId()).size();
                RoomManagement roomManagement = RoomManagement.builder()
                        .id(room.getId())
                        .bookings(currentBookings)
                        .revenue(revenue)
                        .status(room.getRoomStatus())
                        .visits(visits)
                        .type(room.getType())
                        .numBookings(numBookings)
                        .roomNumber(String.valueOf(room.getRoomNumber()))
                        .amenities(amenitiesStrs)
                        .build();
                if (allAmenities != null) {
                    roomManagement.setAdditional(additionalStrs);
                }
                dto.add(roomManagement);
            }

        }
        return dto;
    }

    public AnnualDto annualPerformance(int year) {
        List<Invoice> invoices = invoiceRepository.findAll();
        Map<Month, Double> hash = getMap(year, invoices);

        if (!hash.isEmpty()) {
            List<String> months = new ArrayList<>();
            List<Double> stats = new ArrayList<>();
            for (Month month : Month.values()) {
                if (hash.containsKey(month)) {
                    months.add(getMonthName(month.toString()));
                    stats.add(hash.get(month));
                }
            }
            AnnualDto dto = new AnnualDto();
            dto.setMonths(months);
            dto.setStats(stats);
            return dto;
        }

        return null;
    }

    private static Map<Month, Double> getMap(int year, List<Invoice> invoices) {
        Map<Month, Double> hash = new TreeMap<>();

        if (invoices != null) {
            for (Invoice invoice : invoices) {
                if (invoice.getCreated().getYear() == year) {
                    Booking booking = invoice.getReservation();
                    if (booking != null) {
                        Month month = booking.getCheckout().getMonth();
                        hash.put(month, hash.getOrDefault(month, 0.0) + invoice.getNet());
                    }
                }
            }
        }
        return hash;
    }

    public String generateSpreadsheet(){
        Sheet sheet;
        try (Workbook workbook = new XSSFWorkbook()) {
            sheet = workbook.createSheet("Invoices");
            Row header  = sheet.createRow(0);
            header.createCell(0).setCellValue("Guest");
            header.createCell(1).setCellValue("Invoice Number");
            header.createCell(2).setCellValue("Check In Date");
            header.createCell(3).setCellValue("Check Out Date");
            header.createCell(4).setCellValue("Room Number");
            header.createCell(5).setCellValue("Room Type");
            header.createCell(6).setCellValue("TAX");
            header.createCell(7).setCellValue("NET");
            header.createCell(8).setCellValue("Total Amount");

            List<Invoice> invoices = invoiceRepository.paid();

            if(invoices != null){
                int r = 1;
                for(Invoice invoice : invoices){
                    String guest = invoice.getReservation().getGuest().fullName();
                    String invoiceNumber = invoice.getInvoiceNumber();
                    String checkin = invoice.getReservation().getCheckin().toString();
                    String checkout = invoice.getReservation().getCheckout().toString();
                    String roomNumber = invoice.getReservation().getRoom().getRoomNumber();
                    String roomType = invoice.getReservation().getRoom().getType();
                    double tax = invoice.getVat();
                    double net = invoice.getNet();
                    double total = invoice.getTotalAmount();

                    Row body = sheet.createRow(r++);
                    body.createCell(0).setCellValue(guest);
                    body.createCell(1).setCellValue(invoiceNumber);
                    body.createCell(2).setCellValue(checkin);
                    body.createCell(3).setCellValue(checkout);
                    body.createCell(4).setCellValue(roomNumber);
                    body.createCell(5).setCellValue(roomType);
                    body.createCell(6).setCellValue(tax);
                    body.createCell(7).setCellValue(net);
                    body.createCell(8).setCellValue(total);
                }
            }
            File file = new File("C:/Users/ronni/Documents/MINI PROJECT/api/src/main/resources/utilities/invoices.xlsx");
            boolean isDeleted = false;
            if(file.exists()){
                isDeleted = file.delete();
            }
            if(isDeleted || !file.exists()){
                FileOutputStream fileOutputStream = new FileOutputStream(file);
                workbook.write(fileOutputStream);
                fileOutputStream.close();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return "invoices.xlsx";
    }
}