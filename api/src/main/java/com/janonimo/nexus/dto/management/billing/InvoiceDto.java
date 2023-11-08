package com.janonimo.nexus.dto.management.billing;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.janonimo.nexus.core.models.billing.Invoice;
import com.janonimo.nexus.core.models.billing.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
@Builder
public class InvoiceDto {

    public InvoiceDto(Invoice invoice){
        if(invoice != null){
            this.created = invoice.getCreated();
            this.total = invoice.getTotalAmount();
            this.id = invoice.getId();
            this.guest = invoice.getReservation().getGuest().fullName();
            items = new ArrayList<>();
            this.invoiceNumber = invoice.getInvoiceNumber();
            acknowledged = invoice.getStatus() == InvoiceStatus.APPROVED;
            if(invoice.getDownload() != null){
                this.fileName = invoice.getDownload();
            }
        }
    }
    private int id;
    private LocalDateTime created;
    private double total;
    private String fileName;
    private String invoiceNumber;

    @JsonProperty("items")
    private List<ItemDto> items;

    private String guest;

    private int days;

    private boolean acknowledged;

}
