package com.janonimo.nexus.core.repositories;

import com.janonimo.nexus.core.models.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    @Query("""
    SELECT DISTINCT r FROM Room r
    LEFT JOIN r.bookings b
    WHERE (r.roomStatus = 'AVAILABLE' or r.roomStatus = 'BOOKED') AND (r.type = :type)
    AND (b.checkout IS NULL OR (b.checkout <= :checkin or b.checkout >= :checkin))
""")
    List<Room> search(@Param("checkin") LocalDateTime checkin, @Param("type") String type);

    @Query("""
    SELECT DISTINCT r FROM Room r
    LEFT JOIN r.bookings b
    WHERE (r.roomStatus = 'AVAILABLE' or r.roomStatus = 'BOOKED')
    AND (b.checkout IS NULL OR (b.checkout <= :checkin or b.checkout >= :checkin))
""")
    List<Room> search(@Param("checkin") LocalDateTime checkin);

    @Query("""
            select r from Room r join r.bookings bs where bs.id =:bookingId
            """)
    Optional<Room> findByBooking(Integer bookingId);

}