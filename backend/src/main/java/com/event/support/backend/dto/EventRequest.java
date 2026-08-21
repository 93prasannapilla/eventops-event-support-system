package com.event.support.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EventRequest {

    @NotBlank(message = "Event name is required")
    @Size(max = 150, message = "Event name cannot exceed 150 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotBlank(message = "Venue is required")
    @Size(max = 150, message = "Venue cannot exceed 150 characters")
    private String venue;

    @NotNull(message = "Start date and time are required")
    @Future(message = "Start date and time must be in the future")
    private LocalDateTime startDateTime;

    @NotNull(message = "End date and time are required")
    @Future(message = "End date and time must be in the future")
    private LocalDateTime endDateTime;

    @NotNull(message = "Expected participant count is required")
    @Min(value = 1, message = "Expected participant count must be at least 1")
    private Integer expectedParticipants;

    @NotNull(message = "Creator user ID is required")
    private Long createdByUserId;
}