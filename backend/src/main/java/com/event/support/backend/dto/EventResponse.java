package com.event.support.backend.dto;

import com.event.support.backend.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class EventResponse {

    private Long id;
    private String name;
    private String description;
    private String venue;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer expectedParticipants;
    private EventStatus status;
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;
}