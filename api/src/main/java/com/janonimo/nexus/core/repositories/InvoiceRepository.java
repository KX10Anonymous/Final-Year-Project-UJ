package com.janonimo.nexus.core.repositories;

import com.janonimo.nexus.core.models.billing.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    @Query("""
            select a from Invoice a
             where a.payment = 'PAID'
            """)
    List<Invoice> paid();

    @Query("""
            select i from Invoice i
            join i.reservation r where r.id =:bookingId
            """)
    Optional<Invoice> findByBooking(int bookingId);

    @Query("""
                select i from Invoice i
                 join i.reservation r join r.guest g where g.Id =:userId
            """)
    List<Invoice> findByUser(int userId);

    @Query("""
            select i from Invoice i join i.reservation r
             join r.guest g where g.Id =:userId and i.id =:invoiceId
             and i.payment = 'UNPAID'
            """)
    Optional<Invoice> pay(@Param("userId") int userId, @Param("invoiceId") int invoiceId);

    @Query("""
    select i from Invoice i where i.payment = 'UNPAID'
""")
    List<Invoice> unpaid();

    @Query("""
                SELECT i FROM Invoice i join i.reservation r
                WHERE(r.checkin >= :begin and r.checkout <= :monthEnd)
            """)
    List<Invoice> findByMonth(LocalDateTime begin, LocalDateTime monthEnd);

}
