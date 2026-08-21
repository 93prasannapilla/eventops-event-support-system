package com.event.support.backend.service;

import com.event.support.backend.enums.RequestCategory;
import com.event.support.backend.enums.RequestPriority;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class SmartClassificationService {

    public ClassificationResult classify(
            String title,
            String description,
            Integer participantsAffected,
            LocalDateTime requiredBy) {

        String text = (title + " " + description).toLowerCase();

        RequestCategory category = detectCategory(text);
        RequestPriority priority = detectPriority(
                text, category, participantsAffected, requiredBy);

        int impactScore = calculateImpactScore(
                category, participantsAffected, requiredBy);

        LocalDateTime slaDeadline = calculateSlaDeadline(
                priority, requiredBy);

        return new ClassificationResult(
                category,
                priority,
                impactScore,
                slaDeadline
        );
    }

    private RequestCategory detectCategory(String text) {
        if (containsAny(text,
                "wifi", "wi-fi", "internet", "network",
                "router", "lan", "ethernet")) {
            return RequestCategory.NETWORK;
        }

        if (containsAny(text,
                "power", "electricity", "electrical",
                "socket", "switch", "wire", "voltage",
                "extension board")) {
            return RequestCategory.ELECTRICAL;
        }

        if (containsAny(text,
                "microphone", "speaker", "audio", "sound",
                "projector", "hdmi", "display", "screen",
                "camera", "lighting")) {
            return RequestCategory.AUDIO_VISUAL;
        }

        if (containsAny(text,
                "computer", "laptop", "software", "printer",
                "keyboard", "mouse", "system", "technical",
                "login", "application")) {
            return RequestCategory.TECHNICAL;
        }

        if (containsAny(text,
                "chair", "table", "seating", "stage",
                "room", "hall", "lab", "auditorium",
                "infrastructure")) {
            return RequestCategory.INFRASTRUCTURE;
        }

        if (containsAny(text,
                "repair", "broken", "cleaning", "water",
                "washroom", "maintenance")) {
            return RequestCategory.MAINTENANCE;
        }

        if (containsAny(text,
                "security", "crowd", "gate", "entry",
                "guard", "emergency", "unsafe")) {
            return RequestCategory.SECURITY;
        }

        return RequestCategory.OTHER;
    }

    private RequestPriority detectPriority(
            String text,
            RequestCategory category,
            int participantsAffected,
            LocalDateTime requiredBy) {

        long minutesRemaining = Duration.between(
                LocalDateTime.now(), requiredBy).toMinutes();

        boolean criticalWords = containsAny(text,
                "emergency", "completely down", "power outage",
                "not working", "stopped working", "fire",
                "danger", "unsafe", "urgent");

        if (criticalWords
                || participantsAffected >= 300
                || minutesRemaining <= 30) {
            return RequestPriority.CRITICAL;
        }

        if (participantsAffected >= 100
                || minutesRemaining <= 120
                || category == RequestCategory.NETWORK
                || category == RequestCategory.ELECTRICAL) {
            return RequestPriority.HIGH;
        }

        if (participantsAffected >= 30 || minutesRemaining <= 480) {
            return RequestPriority.MEDIUM;
        }

        return RequestPriority.LOW;
    }

    private int calculateImpactScore(
            RequestCategory category,
            int participantsAffected,
            LocalDateTime requiredBy) {

        int score = 0;

        if (participantsAffected >= 300) {
            score += 50;
        } else if (participantsAffected >= 100) {
            score += 40;
        } else if (participantsAffected >= 30) {
            score += 25;
        } else {
            score += 10;
        }

        long minutesRemaining = Duration.between(
                LocalDateTime.now(), requiredBy).toMinutes();

        if (minutesRemaining <= 30) {
            score += 35;
        } else if (minutesRemaining <= 120) {
            score += 25;
        } else if (minutesRemaining <= 480) {
            score += 15;
        } else {
            score += 5;
        }

        if (category == RequestCategory.NETWORK
                || category == RequestCategory.ELECTRICAL
                || category == RequestCategory.SECURITY) {
            score += 15;
        } else if (category == RequestCategory.AUDIO_VISUAL
                || category == RequestCategory.TECHNICAL) {
            score += 10;
        } else {
            score += 5;
        }

        return Math.min(score, 100);
    }

    private LocalDateTime calculateSlaDeadline(
            RequestPriority priority,
            LocalDateTime requiredBy) {

        LocalDateTime calculatedDeadline = switch (priority) {
            case CRITICAL -> LocalDateTime.now().plusMinutes(15);
            case HIGH -> LocalDateTime.now().plusMinutes(30);
            case MEDIUM -> LocalDateTime.now().plusHours(2);
            case LOW -> LocalDateTime.now().plusHours(8);
        };

        return calculatedDeadline.isBefore(requiredBy)
                ? calculatedDeadline
                : requiredBy;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    public record ClassificationResult(
            RequestCategory category,
            RequestPriority priority,
            int impactScore,
            LocalDateTime slaDeadline) {
    }
}