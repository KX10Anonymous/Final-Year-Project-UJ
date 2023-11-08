package com.janonimo.nexus.user;

import com.janonimo.nexus.core.models.Booking;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * @author JANONIMO
 */

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue
    private int Id;

    private String firstname;

    @Column(unique = true)
    private String phone;

    private String lastname;

    @Column(unique = true)
    private String email;

    @OneToOne(mappedBy = "user")
    private Staff staff;

    private LocalDateTime stamp;

    @Enumerated(EnumType.STRING)
    private LockStatus lockStatus;
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    private Role role;

    @OneToMany(cascade = {CascadeType.ALL, CascadeType.MERGE}, mappedBy = "guest")
    private List<Booking> bookings;

    public String fullName() {
        return (firstname + " " + lastname).toUpperCase();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        assert role != null;
        return List.of(new SimpleGrantedAuthority(role.getRoleName().name()));

    }


    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String getPassword() {
        return password;
    }
}
