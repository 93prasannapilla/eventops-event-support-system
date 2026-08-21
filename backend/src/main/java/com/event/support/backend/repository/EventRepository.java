package com.event.support.backend.repository;

import com.event.support.backend.entity.Event;
import com.event.support.backend.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByStartDateTimeDesc();

    List<Event> findByStatusOrderByStartDateTimeAsc(EventStatus status);

    List<Event> findByCreatedByIdOrderByStartDateTimeDesc(Long userId);
}