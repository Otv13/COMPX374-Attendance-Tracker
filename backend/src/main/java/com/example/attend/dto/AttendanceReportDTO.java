package com.example.attend.dto;

import java.time.LocalDateTime;

public record AttendanceReportDTO(
    String studentUsername,
    String studentId,
    String studentName,
    LocalDateTime submittedAt,
    Double lat,
    Double lng,
    Double accuracyMeters,
    String ipTruncated,
    String deviceHash,
    Boolean flagLate,
    Boolean flagGeofence,
    Boolean flagLowAccuracy,
    String flagNote
) {}
