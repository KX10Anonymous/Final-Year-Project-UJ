package com.janonimo.nexus.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="staff")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Staff {
    @Id
    @GeneratedValue
    private int id;

    private String email;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
