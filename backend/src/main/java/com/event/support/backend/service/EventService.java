package com.event.support.backend.service;

import com.event.support.backend.dto.EventRequest;
import com.event.support.backend.dto.EventResponse;
import com.event.support.backend.entity.Event;
import com.event.support.backend.entity.User;
import com.event.support.backend.enums.EventStatus;
import com.event.support.backend.enums.Role;
import com.event.support.backend.repository.EventRepository;
import com.event.support.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public EventResponse createEvent(EventRequest request) {
        if (!request.getEndDateTime().isAfter(request.getStartDateTime())) {
            throw new IllegalArgumentException(
                    "Event end date and time must be after the start date and time");
        }

        User creator = userRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new IllegalArgumentException("Creator user was not found"));

        if (creator.getRole() != Role.ORGANIZER
                && creator.getRole() != Role.EVENT_MANAGER
                && creator.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException(
                    "Only an organizer, event manager or admin can create an event");
        }

        Event event = Event.builder()
                .name(request.getName().trim())
                .description(cleanOptionalText(request.getDescription()))
                .venue(request.getVenue().trim())
                .startDateTime(request.getStartDateTime())
                .endDateTime(request.getEndDateTime())
                .expectedParticipants(request.getExpectedParticipants())
                .status(EventStatus.PLANNED)
                .createdBy(creator)
                .build();

        return toResponse(eventRepository.save(event));
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByStartDateTimeDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event was not found"));

        return toResponse(event);
    }

    private String cleanOptionalText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        return text.trim();
    }

    private EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getVenue(),
                event.getStartDateTime(),
                event.getEndDateTime(),
                event.getExpectedParticipants(),
                event.getStatus(),
                event.getCreatedBy().getId(),
                event.getCreatedBy().getFullName(),
                event.getCreatedAt()
        );
    }
}