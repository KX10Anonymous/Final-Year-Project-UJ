package com.janonimo.nexus.core.communication;

import com.janonimo.nexus.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@Entity
@Table(name="notifications")
@RequiredArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue
    private int Id;

    private LocalDateTime created;

    private String message;

    @Enumerated(EnumType.STRING)
    private ReceiptStatus receiptStatus;

    @ManyToOne
    private User user;
}
