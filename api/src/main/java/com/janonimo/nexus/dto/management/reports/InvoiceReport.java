package com.janonimo.nexus.dto.management.reports;

import com.janonimo.nexus.core.models.billing.Invoice;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InvoiceReport {
    private int id;
    private String name;
    private double amount;
    private LocalDateTime checkin;
    private LocalDateTime checkout;
    private String type;
    private String fileName;

    public InvoiceReport(@NotNull Invoice invoice){
            this.amount = invoice.getTotalAmount();
            this.checkin = invoice.getReservation().getCheckin();
            this.checkout = invoice.getReservation().getCheckout();
            this.name = invoice.getReservation().getGuest().fullName();
            this.type = invoice.getReservation().getRoom().getType();
            this.id = invoice.getId();
            if(invoice.getDownload() != null){
                this.fileName = invoice.getDownload();
            }
    }
}
