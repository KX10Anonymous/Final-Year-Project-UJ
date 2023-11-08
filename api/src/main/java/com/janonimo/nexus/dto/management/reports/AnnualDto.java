package com.janonimo.nexus.dto.management.reports;

import lombok.Data;

import java.util.List;

@Data
public class AnnualDto {
    private List<String> months;
    private List<Double> stats;
}
