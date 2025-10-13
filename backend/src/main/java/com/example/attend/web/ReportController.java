package com.example.attend.web;

import com.example.attend.dto.AttendanceReportDTO;
import com.example.attend.service.SimpleReportService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

/**
 * Minimal Report API that DOES NOT modify your existing code.
 * Base path: /api/report
 * Endpoints:
 *   - JSON: GET /api/report/sessions/{id}?page=0&size=50&privacy=true
 *   - CSV : GET /api/report/sessions/{id}.csv?privacy=true
 */
@RestController
@RequestMapping("/api/report")
public class ReportController {

    private final SimpleReportService reportService;

    public ReportController(SimpleReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * JSON (paged)
     * GET /api/report/sessions/1?page=0&size=50&privacy=true
     */
    @GetMapping("/sessions/{id}")
    public Page<AttendanceReportDTO> getReport(
            @PathVariable("id") Long sessionId,
            @RequestParam(value = "privacy", required = false, defaultValue = "false") boolean privacy,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "50") int size
    ) {
        return reportService.pageForSession(sessionId, privacy, page, size);
    }

    /**
     * CSV download
     * GET /api/report/sessions/1.csv?privacy=true
     */
    @GetMapping(value = "/sessions/{id}.csv", produces = "text/csv")
    public void exportCsv(
            @PathVariable("id") Long sessionId,
            @RequestParam(value = "privacy", required = false, defaultValue = "false") boolean privacy,
            HttpServletResponse response
    ) throws Exception {
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=attendance-session-" + sessionId + ".csv");
        response.setContentType(MediaType.TEXT_PLAIN_VALUE);

        Page<AttendanceReportDTO> page = reportService.pageForSession(sessionId, privacy, 0, 10_000);

        try (PrintWriter w = response.getWriter()) {
            w.println("studentUsername,studentId,studentName,submittedAt,lat,lng,accuracyMeters,ipTruncated,deviceHash,flagLate,flagGeofence,flagLowAccuracy,flagNote");

            for (AttendanceReportDTO r : page.getContent()) {
                w.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                        csv(r.studentUsername()),
                        csv(r.studentId()),
                        csv(r.studentName()),
                        csv(r.submittedAt() == null ? "" : r.submittedAt().toString()),
                        csv(d(r.lat())), csv(d(r.lng())), csv(d(r.accuracyMeters())),
                        csv(r.ipTruncated()), csv(r.deviceHash()),
                        b(r.flagLate()), b(r.flagGeofence()), b(r.flagLowAccuracy()),
                        csv(r.flagNote()));
            }
        }
    }

    private String csv(String s) {
        if (s == null) return "";
        String t = s.replace("\"", "\"\"");
        if (t.contains(",") || t.contains("\n") || t.contains("\r")) return "\"" + t + "\"";
        return t;
    }

    private String d(Double d) {
        return d == null ? "" : d.toString();
    }

    private String b(Boolean b) {
        return b == null ? "" : b ? "true" : "false";
    }
}
