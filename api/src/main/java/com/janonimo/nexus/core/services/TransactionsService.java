package com.janonimo.nexus.core.services;

import com.janonimo.nexus.core.models.Amenity;
import com.janonimo.nexus.core.models.Booking;
import com.janonimo.nexus.core.models.Room;
import com.janonimo.nexus.core.models.billing.Invoice;
import com.janonimo.nexus.core.repositories.BookingRepository;
import com.janonimo.nexus.core.repositories.InvoiceRepository;
import com.janonimo.nexus.dto.management.reports.TransactionsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionsService {
    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;

    private int getTotalBookings() {
        return (int) bookingRepository.count();
    }

    private int getCheckedInBookings() {
        return bookingRepository.inBookings().size();
    }

    private double getCheckinAverage(double totalBookings) {
        if (totalBookings > 0) {
            int checkedIn = bookingRepository.bySuccess().size();
            return (checkedIn / totalBookings) * 100;
        }
        return 0;
    }

    private double getExpectedPayments() {
        double total = 0.0;
        List<Booking> bookings = bookingRepository.findPending();
        if (bookings != null) {
            for (Booking booking : bookings) {
                Room room = booking.getRoom();
                List<Amenity> amenities = room.getAmenities();
                if (amenities != null) {
                    for (Amenity amenity : amenities) {
                        total += amenity.getRate();
                    }
                }
                total += room.getRate();
            }
        }
        return total;
    }

    private double getRevenue(double expectedPayments) {
        double total = 0.0;
        total += expectedPayments;
        List<Invoice> invoices = invoiceRepository.paid();
        if (invoices != null) {
            for (Invoice invoice : invoices) {
                total += invoice.getTotalAmount();
            }
        }
        return total;
    }

    private double getMonthlyVisits() {
        return bookingRepository.findTotalVisits().size();
    }

    private int getMonthlyBookings() {
        LocalDateTime thisMonth = LocalDateTime.now();
        LocalDateTime begin = LocalDateTime.of(thisMonth.getYear(), thisMonth.getMonth(), thisMonth.getDayOfMonth(), 1, 59);
        LocalDateTime monthEnd = LocalDateTime.of(thisMonth.getYear(), thisMonth.getMonth(), getMonthEndDay(begin), 1, 59);
        return bookingRepository.findByMonth(begin, monthEnd).size();
    }

    private int getMonthEndDay(LocalDateTime begin) {
        int month = begin.getMonthValue();
        return switch (month) {
            case 1, 10, 8, 7, 5, 3, 12 -> 31;
            case 2 -> 28;
            case 4, 9, 6, 11 -> 30;
            default -> 1;
        };
    }

    private double getMonthlyGrowth(double revenue) {
        double total = 0.0;

        LocalDateTime thisMonth = LocalDateTime.now();
        LocalDateTime begin = LocalDateTime.of(thisMonth.getYear(), thisMonth.getMonth(), thisMonth.getDayOfMonth(), 1, 59);
        LocalDateTime monthEnd = LocalDateTime.of(thisMonth.getYear(), thisMonth.getMonth(), getMonthEndDay(begin), 1, 59);
        List<Invoice> invoices = invoiceRepository.findByMonth(begin, monthEnd);
        if (invoices != null) {
            for (Invoice invoice : invoices) {
                total += invoice.getTotalAmount();
            }
        }
        if (total > 0) {
            return (total / revenue) * 100;
        } else {
            return 0;
        }
    }

    private double getAveragePayment() {
        double total = 0.0;
        List<Invoice> invoices = invoiceRepository.paid();
        if (invoices != null) {
            for (Invoice invoice : invoices) {
                total += invoice.getTotalAmount();
            }
            return total / invoices.size();
        }
        return 0;
    }

    private double getBookingGrowth(int monthlyBookings, int totalBookings) {
        if (totalBookings > 0) {
            return ((double) monthlyBookings / totalBookings) * 100;
        }
        return 0;
    }

    public TransactionsDto breakdown() {
        int totalBookings = getTotalBookings();
        int checkedInBookings = getCheckedInBookings();
        double expectedPayments = getExpectedPayments();
        double revenue = getRevenue(expectedPayments);
        double monthlyVisits = getMonthlyVisits();
        int monthlyBookings = getMonthlyBookings();
        double monthlyGrowth = getMonthlyGrowth(expectedPayments);
        double averagePayment = getAveragePayment();
        double bookingGrowth = getBookingGrowth(monthlyBookings, totalBookings);
        double checkinAverage = getCheckinAverage(totalBookings);

        return TransactionsDto.builder().totalBookings(totalBookings)
                .checkedInBookings(checkedInBookings)
                .expectedPayments(expectedPayments)
                .revenue(revenue)
                .visits(monthlyVisits)
                .monthlyBookings(monthlyBookings)
                .monthlyGrowth(monthlyGrowth)
                .averagePayment(averagePayment)
                .bookingsGrowth(bookingGrowth)
                .checkinAverage(checkinAverage)
                .build();
    }
}
