package com.example.attend.service;

import com.example.attend.dto.AttendanceReportDTO;
import org.springframework.data.domain.Page;
import java.util.List;

/**
 * Service interface for attendance reporting.
 * Provides paginated session reports and full database exports.
 */
public interface SimpleReportService {

    /**
     * Retrieves paginated attendance report for a given session.
     *
     * @param sessionId The session ID.
     * @param privacy   Whether to anonymize usernames and IDs.
     * @param page      Page index.
     * @param size      Page size.
     * @return Page of AttendanceReportDTO objects.
     */
    Page<AttendanceReportDTO> pageForSession(Long sessionId, boolean privacy, int page, int size);

    /**
     * Retrieves all attendance records from the database (no pagination).
     * Used for CSV report exports.
     *
     * @return List of all AttendanceReportDTO objects.
     */
    List<AttendanceReportDTO> findAllReports();
}
