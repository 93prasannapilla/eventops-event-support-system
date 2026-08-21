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
public class SupportRequestCreateRequest {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotNull(message = "Requester user ID is required")
    private Long requestedByUserId;

    @NotBlank(message = "Request title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Request description is required")
    @Size(min = 10, max = 2000,
            message = "Description must contain 10 to 2000 characters")
    private String description;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String location;

    @NotNull(message = "Number of affected participants is required")
    @Min(value = 1, message = "At least one participant must be affected")
    private Integer participantsAffected;

    @NotNull(message = "Required-by date and time are required")
    @Future(message = "Required-by date and time must be in the future")
    private LocalDateTime requiredBy;
}