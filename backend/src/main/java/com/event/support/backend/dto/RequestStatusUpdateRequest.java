package com.event.support.backend.dto;

import com.event.support.backend.enums.RequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestStatusUpdateRequest {

    @NotNull(message = "New request status is required")
    private RequestStatus status;

    @Size(max = 1000,
            message = "Resolution notes cannot exceed 1000 characters")
    private String resolutionNotes;
}