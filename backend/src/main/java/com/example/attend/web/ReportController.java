/**
 * Minimal Report API that DOES NOT modify your existing code.
 * Base path: /api/report
 * Endpoints:
 *   - JSON: GET /api/report/sessions/{id}?page=0&size=50&privacy=true
 *   - CSV : GET /api/report/sessions/{id}.csv?privacy=true

 com.example.attend.web;

import com.example.attend.service.SimpleReportService;     
import org.springframework.data.domain.Page;                 
import org.springframework.http.HttpHeaders;                 
import org.springframework.http.MediaType;                   
import org.springframework.web.bind.annotation.*;            

import jakarta.servlet.http.HttpServletResponse;             
import java.io.PrintWriter;                                  


@RestController 
@RequestMapping("/api/report") 
public class ReportController { 

    private final SimpleReportService reportService; 

    // constructor injection 
    public ReportController(SimpleReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * JSON (paged)
     * GET /api/report/sessions/1?page=0&size=50&privacy=true
  
    @GetMapping("/sessions/{id}")
    public Page<AttendanceReportDTO> getReport(
            @PathVariable("id") Long sessionId,
            @RequestParam(value = "privacy", required = false, defaultValue = "false") boolean privacy,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "50") int size
    ) {
        //delegate to our new service 
        return reportService.pageForSession(sessionId, privacy, page, size);
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

        // fetch a big single page for a simple CSV 
        Page<AttendanceReportDTO> page = reportService.pageForSession(sessionId, privacy, 0, 10_000);

        try (PrintWriter w = response.getWriter()) {
            // CSV header
            w.println("attendanceId,sessionId,username,studentId,timestamp,late,geofence,lowAccuracy,note");

            // SimpleAttendanceRow is a plain class with public fields 
            for (AttendanceReportDTO r : page.getContent()) {
                w.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                        n(r.attendanceId),
                        n(r.sessionId),
                        csv(r.username),
                        csv(r.studentId),
                        csv(r.timestamp == null ? null : r.timestamp.toString()),
                        String.valueOf(r.late),
                        String.valueOf(r.geofence),
                        String.valueOf(r.lowAccuracy),
                        csv(r.note)
                );
            }
        }
    }

    // tiny CSV helpers quote fields that contain commas/newlines/quotes
    private String csv(String s) {
        if (s == null) return "";
        String t = s.replace("\"", "\"\"");
        if (t.contains(",") || t.contains("\n") || t.contains("\r")) return "\"" + t + "\"";
        return t;
    }
    private String n(Long v) { return v == null ? "" : v.toString(); }
}

   */
