package com.example.attend.web;

import com.example.attend.dto.AttendanceReportDTO;
import com.example.attend.service.SimpleReportService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/report")
public class ReportController {

    private final SimpleReportService reportService;

    public ReportController(SimpleReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sessions/{id}")
    public Page<AttendanceReportDTO> getReport(
            @PathVariable("id") Long sessionId,
            @RequestParam(value = "privacy", required = false, defaultValue = "false") boolean privacy,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "50") int size
    ) {
        return reportService.pageForSession(sessionId, privacy, page, size);
    }

    /** ✅ Simple demo: export all records as CSV */
    @GetMapping(value = "/all.csv", produces = "text/csv")
    public void exportAllCsv(HttpServletResponse response) throws Exception {
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance-all.csv");
        response.setContentType(MediaType.TEXT_PLAIN_VALUE);

        List<AttendanceReportDTO> allReports = reportService.findAllReports();

        try (PrintWriter w = response.getWriter()) {
            w.println("studentId,studentName,submittedAt,flagLate,flagGeofence,flagLowAccuracy");

            for (AttendanceReportDTO r : allReports) {
                w.printf("%s,%s,%s,%s,%s,%s%n",
                        csv(r.studentId()),
                        csv(r.studentName()),
                        csv(r.submittedAt() == null ? "" : r.submittedAt().toString()),
                        b(r.flagLate()), b(r.flagGeofence()), b(r.flagLowAccuracy()));
            }
        }
    }

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
