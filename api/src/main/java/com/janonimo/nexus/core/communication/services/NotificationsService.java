package com.janonimo.nexus.core.communication.services;

import com.janonimo.nexus.core.communication.Notification;
import com.janonimo.nexus.core.communication.ReceiptStatus;
import com.janonimo.nexus.dto.user.NotificationResponse;
import com.janonimo.nexus.user.User;
import com.janonimo.nexus.util.RequestHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationsService {
    private final NotificationsRepository notificationRepository;
    private final RequestHandler requestHandler;

    public void create(Notification notification) {
        notificationRepository.saveAndFlush(notification);
    }

    public void update(int id) {
            Notification notification = notificationRepository.getReferenceById(id);
            if (notification != null) {
                notification.setReceiptStatus(ReceiptStatus.READ);
                notificationRepository.save(notification);
            }
    }

    public List<NotificationResponse> notifications(String jwt) {
            User user = requestHandler.getUser(jwt);
            if (user != null) {
                List<Notification> tempNotifications = notificationRepository.unread(user.getId());
                return notificationResponseArrayList(tempNotifications);
            }
        return null;
    }

    private List<NotificationResponse> notificationResponseArrayList(List<Notification> notifications) {
        List<NotificationResponse> response = null;
        if (notifications != null && !notifications.isEmpty()) {
            response = new ArrayList<>();
            for (Notification n : notifications) {
                var temp = NotificationResponse.builder()
                        .Id(n.getId())
                        .message(n.getMessage())
                        .created(n.getCreated())
                        .build();
                response.add(temp);
            }
        }
        return response;
    }
}
