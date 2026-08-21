
package com.event.support.backend.dto;

import com.event.support.backend.enums.RequestCategory;
import com.event.support.backend.enums.RequestPriority;
import com.event.support.backend.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class SupportRequestResponse {

    private Long id;
    private String requestCode;

    private Long eventId;
    private String eventName;

    private Long requestedByUserId;
    private String requestedByName;

    private Long assignedToUserId;
    private String assignedToName;

    private String title;
    private String description;
    private String location;
    private Integer participantsAffected;
    private LocalDateTime requiredBy;

    private RequestCategory category;
    private RequestPriority priority;
    private RequestStatus status;
    private Integer impactScore;
    private LocalDateTime slaDeadline;

    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}