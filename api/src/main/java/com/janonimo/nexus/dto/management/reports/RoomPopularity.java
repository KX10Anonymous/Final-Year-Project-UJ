package com.janonimo.nexus.dto.management.reports;

import lombok.Data;

import java.util.List;

@Data
public class RoomPopularity {
    private List<String> type;
    private List<Integer> visits;
}
