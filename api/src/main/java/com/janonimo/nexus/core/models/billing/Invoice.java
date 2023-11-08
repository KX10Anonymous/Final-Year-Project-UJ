package com.janonimo.nexus.core.models.billing;

import com.janonimo.nexus.core.models.Booking;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "invoices")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Invoice {
    @Id
    @GeneratedValue
    private int id;

    private LocalDateTime created;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", referencedColumnName = "id")
    private Booking reservation;

    private double totalAmount;

    private double vat;

    private double net;

    private String invoiceNumber;
    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentStatus payment;

    private String download;
}
