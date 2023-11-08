package com.janonimo.nexus.dto.management.reports;

import lombok.Data;

import java.util.List;

@Data
public class Seasonality {
    private List<String> months;
    private List<Integer> stats;


}
