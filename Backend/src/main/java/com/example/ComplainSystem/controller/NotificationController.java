package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.response.NotificationResponse;
import com.example.ComplainSystem.services.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> getMyNotifications(Authentication auth) {
        return notificationService.getNotificationsForUser(auth.getName());
    }

    @PutMapping("/read-all")
    public void markAllRead(Authentication auth) {
        notificationService.markAllRead(auth.getName());
    }
}
