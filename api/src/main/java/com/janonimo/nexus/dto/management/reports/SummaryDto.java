package com.janonimo.nexus.dto.management.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@AllArgsConstructor
public class SummaryDto {
    private String title;
    private int visits;
}
