package com.event.support.backend.service;

import com.event.support.backend.dto.RequestStatusUpdateRequest;
import com.event.support.backend.dto.SupportRequestCreateRequest;
import com.event.support.backend.dto.SupportRequestResponse;
import com.event.support.backend.entity.Event;
import com.event.support.backend.entity.SupportRequest;
import com.event.support.backend.entity.User;
import com.event.support.backend.enums.RequestStatus;
import com.event.support.backend.repository.EventRepository;
import com.event.support.backend.repository.SupportRequestRepository;
import com.event.support.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportRequestService {

    private final SupportRequestRepository supportRequestRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final SmartClassificationService classificationService;

    @Transactional
    public SupportRequestResponse createRequest(
            SupportRequestCreateRequest request) {

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Event was not found"));

        User requester = userRepository.findById(
                        request.getRequestedByUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Requester was not found"));

        SmartClassificationService.ClassificationResult classification =
                classificationService.classify(
                        request.getTitle(),
                        request.getDescription(),
                        request.getParticipantsAffected(),
                        request.getRequiredBy()
                );

        SupportRequest supportRequest = SupportRequest.builder()
                .event(event)
                .requestedBy(requester)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .location(request.getLocation().trim())
                .participantsAffected(
                        request.getParticipantsAffected())
                .requiredBy(request.getRequiredBy())
                .category(classification.category())
                .priority(classification.priority())
                .status(RequestStatus.SUBMITTED)
                .impactScore(classification.impactScore())
                .slaDeadline(classification.slaDeadline())
                .build();

        return toResponse(
                supportRequestRepository.save(supportRequest));
    }

    @Transactional(readOnly = true)
    public List<SupportRequestResponse> getAllRequests() {
        return supportRequestRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SupportRequestResponse getRequestById(Long requestId) {
        SupportRequest request =
                findRequestOrThrow(requestId);

        return toResponse(request);
    }

    @Transactional(readOnly = true)
    public List<SupportRequestResponse> getRequestsByEvent(
            Long eventId) {

        return supportRequestRepository
                .findByEventIdOrderByCreatedAtDesc(eventId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SupportRequestResponse updateStatus(
            Long requestId,
            RequestStatusUpdateRequest updateRequest) {

        SupportRequest request =
                findRequestOrThrow(requestId);

        RequestStatus currentStatus = request.getStatus();
        RequestStatus newStatus = updateRequest.getStatus();

        if (currentStatus == newStatus) {
            return toResponse(request);
        }

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new IllegalArgumentException(
                    "Request status cannot change from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        if (newStatus == RequestStatus.RESOLVED) {
            String notes = updateRequest.getResolutionNotes();

            if (notes == null || notes.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Resolution notes are required when "
                                + "marking a request as resolved");
            }

            request.setResolutionNotes(notes.trim());
            request.setResolvedAt(LocalDateTime.now());
        }

        if (newStatus == RequestStatus.CLOSED) {
            request.setClosedAt(LocalDateTime.now());
        }

        request.setStatus(newStatus);

        return toResponse(
                supportRequestRepository.save(request));
    }

    private boolean isValidTransition(
            RequestStatus currentStatus,
            RequestStatus newStatus) {

        return switch (currentStatus) {
            case SUBMITTED ->
                    newStatus == RequestStatus.ASSIGNED
                            || newStatus == RequestStatus.CANCELLED;

            case ASSIGNED ->
                    newStatus == RequestStatus.ACCEPTED
                            || newStatus == RequestStatus.CANCELLED;

            case ACCEPTED ->
                    newStatus == RequestStatus.IN_PROGRESS
                            || newStatus == RequestStatus.CANCELLED;

            case IN_PROGRESS ->
                    newStatus == RequestStatus.RESOLVED
                            || newStatus == RequestStatus.CANCELLED;

            case RESOLVED ->
                    newStatus == RequestStatus.CLOSED
                            || newStatus == RequestStatus.IN_PROGRESS;

            case CLOSED, CANCELLED -> false;
        };
    }

    private SupportRequest findRequestOrThrow(Long requestId) {
        return supportRequestRepository.findById(requestId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Support request was not found"));
    }

    private SupportRequestResponse toResponse(
            SupportRequest request) {

        Long assignedUserId = null;
        String assignedUserName = null;

        if (request.getAssignedTo() != null) {
            assignedUserId = request.getAssignedTo().getId();
            assignedUserName =
                    request.getAssignedTo().getFullName();
        }

        return new SupportRequestResponse(
                request.getId(),
                request.getRequestCode(),
                request.getEvent().getId(),
                request.getEvent().getName(),
                request.getRequestedBy().getId(),
                request.getRequestedBy().getFullName(),
                assignedUserId,
                assignedUserName,
                request.getTitle(),
                request.getDescription(),
                request.getLocation(),
                request.getParticipantsAffected(),
                request.getRequiredBy(),
                request.getCategory(),
                request.getPriority(),
                request.getStatus(),
                request.getImpactScore(),
                request.getSlaDeadline(),
                request.getResolutionNotes(),
                request.getResolvedAt(),
                request.getClosedAt(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}