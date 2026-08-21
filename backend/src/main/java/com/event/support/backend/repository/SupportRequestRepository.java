package com.event.support.backend.repository;

import com.event.support.backend.entity.SupportRequest;
import com.event.support.backend.enums.RequestPriority;
import com.event.support.backend.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupportRequestRepository
        extends JpaRepository<SupportRequest, Long> {

    Optional<SupportRequest> findByRequestCode(String requestCode);

    List<SupportRequest> findAllByOrderByCreatedAtDesc();

    List<SupportRequest> findByEventIdOrderByCreatedAtDesc(Long eventId);

    List<SupportRequest> findByRequestedByIdOrderByCreatedAtDesc(Long userId);

    List<SupportRequest> findByAssignedToIdOrderByCreatedAtDesc(Long userId);

    List<SupportRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    List<SupportRequest> findByPriorityOrderByCreatedAtDesc(
            RequestPriority priority);

    long countByEventIdAndStatus(Long eventId, RequestStatus status);
}