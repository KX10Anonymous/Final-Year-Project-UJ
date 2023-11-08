package com.janonimo.nexus.core.communication.services;

import com.janonimo.nexus.core.communication.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationsRepository extends JpaRepository<Notification, Integer> {
    @Query(value = """
                    SELECT n FROM Notification n WHERE
                     n.receiptStatus = 'UNREAD' and n.user.Id = :id""")
    List<Notification> unread(int id);
}
