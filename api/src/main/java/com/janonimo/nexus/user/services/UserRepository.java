package com.janonimo.nexus.user.services;

import com.janonimo.nexus.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/**
 * @author JANONIMO
 */
public interface UserRepository extends JpaRepository<User, Integer> {
    @Query(value = """
                    select a from User a where a.email = :email
            """)
    Optional<User> findByEmail(String email);

    @Query(value = """
                    select a from User a where a.email = :phone
            """)
    Optional<User> findByPhone(String phone);

    @Query(value = """
            select u from User u inner join u.role r
            where r.roleName = 'GUEST'
            """)
    List<User> findGuests();

    @Query(value = """
            select distinct u from User u inner join u.role r join u.bookings b
            where b.status = 'CHECKED_IN' and r.roleName = 'GUEST'
            """)
    List<User> findCheckedInGuests();

    @Query("""
            select u from User u join u.role r where r.roleName = 'MANAGER'
            """)
    List<User> managers();


    @Query("""
            select u from User u join u.role r where u.role.roleName = 'CLERK'
            """)
    List<User> clerks();

    @Query("""
        select u from User u join u.role r where r.roleName <> 'GUEST'
        """)
    List<User> staff();
}
