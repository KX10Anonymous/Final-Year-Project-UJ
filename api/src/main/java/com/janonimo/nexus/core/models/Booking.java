package com.janonimo.nexus.core.models;

import com.janonimo.nexus.core.models.billing.Invoice;
import com.janonimo.nexus.core.models.billing.InvoiceStatus;
import com.janonimo.nexus.core.models.billing.PaymentStatus;
import com.janonimo.nexus.user.User;
import com.janonimo.nexus.util.StringRandomizer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Table(name = "bookings")
@Builder
public class Booking {

    @Id
    @GeneratedValue
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User guest;

    @ManyToOne(fetch = FetchType.LAZY)
    private Room room;


    private LocalDateTime checkin;

    private LocalDateTime checkout;

    private LocalDateTime expiration;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", referencedColumnName = "id")
    private Invoice invoice;

    public double getTotalRate() {
        double total = 0;
        if (room != null) {
            if (room.getAmenities() != null) {
                double amenitiesRate = 0;
                for (Amenity amenity : room.getAmenities()) {
                    if(this.getCheckin().isAfter(amenity.getCreated())){
                        amenitiesRate += amenity.getRate();
                    }
                }
                for (int r = 0; r < getDays(); r++) {
                    total += (room.getRate() + amenitiesRate);
                }
            }

        }


        return total;
    }

    public int getDays() {
        int days;
        if(this.getCheckin().getYear() < this.getCheckout().getYear()){
            days = (365-this.getCheckin().getDayOfYear()) + this.getCheckout().getDayOfYear();
        }else {
            days = this.getCheckout().getDayOfYear() - this.getCheckin().getDayOfYear();
        }

        if(this.getCheckout().getDayOfYear() == this.getCheckin().getDayOfYear()){
            days = 1;
        }
        return days;
    }


    public Invoice getNewInvoice() {
        Invoice invoice = null;
        if (this.getStatus() == BookingStatus.CHECKED_IN || this.getStatus() == BookingStatus.CHECKED_OUT) {
                double total = getTotalRate();
                double vat = total * 0.15;
                double net = total - vat;
                invoice = Invoice.builder().reservation(this)
                        .created(LocalDateTime.now())
                        .status(InvoiceStatus.APPROVED)
                        .payment(PaymentStatus.PAID)
                        .totalAmount(total)
                        .invoiceNumber(new StringRandomizer().getLetters(10)+this.getId())
                        .vat(vat)
                        .net(net)
                        .build();
        }

        return invoice;
    }
}
