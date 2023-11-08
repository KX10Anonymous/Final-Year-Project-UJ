package com.janonimo.nexus.dto.management.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionsDto {
    private int totalBookings;
    private int checkedInBookings;
    private double expectedPayments;
    private double revenue;
    private double visits;

    private int monthlyBookings;
    private double checkinAverage;
    private double monthlyGrowth;
    private double averagePayment;
    private double bookingsGrowth;
}
