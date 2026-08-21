package com.event.support.backend.controller;

import com.event.support.backend.dto.RequestStatusUpdateRequest;
import com.event.support.backend.dto.SupportRequestCreateRequest;
import com.event.support.backend.dto.SupportRequestResponse;
import com.event.support.backend.service.SupportRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class SupportRequestController {

    private final SupportRequestService supportRequestService;

    @PostMapping
    public ResponseEntity<SupportRequestResponse> createRequest(
            @Valid @RequestBody SupportRequestCreateRequest request) {

        SupportRequestResponse response =
                supportRequestService.createRequest(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<SupportRequestResponse>>
            getAllRequests() {

        return ResponseEntity.ok(
                supportRequestService.getAllRequests());
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<SupportRequestResponse> getRequestById(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                supportRequestService.getRequestById(requestId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<SupportRequestResponse>>
            getRequestsByEvent(
                    @PathVariable Long eventId) {

        return ResponseEntity.ok(
                supportRequestService
                        .getRequestsByEvent(eventId));
    }

    @PatchMapping("/{requestId}/status")
    public ResponseEntity<SupportRequestResponse> updateStatus(
            @PathVariable Long requestId,
            @Valid @RequestBody
            RequestStatusUpdateRequest updateRequest) {

        return ResponseEntity.ok(
                supportRequestService.updateStatus(
                        requestId,
                        updateRequest
                )
        );
    }
}