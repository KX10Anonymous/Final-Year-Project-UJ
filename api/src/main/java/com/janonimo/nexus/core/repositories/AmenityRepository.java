package com.janonimo.nexus.core.repositories;

import com.janonimo.nexus.core.models.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@SuppressWarnings("unused")
@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Integer> {

    @Query("""
                select a from Amenity a where a.description =:description
            """)
    Optional<Amenity> findByName(String description);

    @Query("""
                select a from Amenity a join a.rooms r where r.id =:room
            """)
    List<Amenity> findByRoom(@Param("room") int room);

    @Query("""
                select a from Amenity a join a.rooms r join r.amenities ra where r.id <>:room
            """)
    List<Amenity> findNotByRoom(@Param("room") int room);
}
