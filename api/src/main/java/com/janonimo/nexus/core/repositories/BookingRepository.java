package com.janonimo.nexus.core.repositories;

import com.janonimo.nexus.core.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    @Query("""
            select b from Booking b where b.status = 'PENDING'
            """)
    List<Booking> findPending();

    @Query("""
               select b from Booking b where b.room.id =:id and b.status = 'CHECKED_IN'
            """)
    Optional<Booking> findByRoom(Integer id);

    @Query("""
               select b from Booking b where b.room.id =:id
            """)
    List<Booking> findRoomBookings(Integer id);

    @Query("""
               select b from Booking b where b.room.id =:id and b.status = 'PENDING'
            """)
    List<Booking> findPendingRoomBookings(Integer id);

    @Query("""
            select b from Booking b  where b.guest.Id =:id
            and b.status = 'PENDING'
            """)
    List<Booking> userBookings(int id);

    @Query("""
            select b from Booking b  where b.guest.Id =:id
            and (b.status = 'CHECKED_IN' or b.status = 'CHECKED_OUT')
            """)
    List<Booking> visits(int id);

    @Query("""
            select b from Booking b  join b.room r
            where r.id =:roomId and b.status = 'PENDING'
            """)
    List<Booking> roomBookings(int roomId);

    @Query("""
            select distinct b from Booking b  where b.guest.Id =:id
            and b.status = 'CHECKED_IN'
            """)
    Optional<Booking> userBooking(int id);

    @Query("""
            select b from Booking b  where b.status = 'CHECKED_OUT'
            """)
    List<Booking> processedBookings();

    @Query("""
            select b from Booking b  where b.status = 'CHECKED_IN'
            """)
    List<Booking> inBookings();

    @Query("""
            select b from Booking b join b.room ro where b.status = 'CHECKED_OUT'
            and ro.type =:type
            """)
    List<Booking> processedBookings(String type);

    @Query("""
            select b from Booking b  where b.room.id =:id
            and (b.status = 'CHECKED_IN' or b.status = 'CHECKED_OUT')
            """)
    List<Booking> roomVisits(int id);
    @Query("""
            select b from Booking b join b.invoice i where i.id =:invoiceId
            """)
    Optional<Booking> findByInvoice(int invoiceId);

    @Query("""
                SELECT b FROM Booking b
                WHERE(b.checkin >= :begin and b.checkout <= :monthEnd)
            """)
    List<Booking> findByMonth(LocalDateTime begin, LocalDateTime monthEnd);

    @Query("""
                SELECT b FROM Booking b
                WHERE
                 (b.status = 'CHECKED_IN' or b.status = 'CHECKED_OUT')
            """)
    List<Booking> findTotalVisits();
    @Query("""
            select b from Booking b where b.status = 'CHECKED_OUT' or
             b.status = 'CHECKED_IN'
            """)
    List<Booking> bySuccess();

    @Query("""
            select b from Booking b join b.room r where
             b.status = 'CHECKED_IN' and r.id =:roomId
            """)
    List<Booking> byPendingAndCheckin(int roomId);
}
