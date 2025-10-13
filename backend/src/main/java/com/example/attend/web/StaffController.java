package com.example.attend.web;

import com.example.attend.dto.AttendanceReportDTO;
import com.example.attend.model.Attendance;
import com.example.attend.model.Session;
import com.example.attend.model.Student;
import com.example.attend.repo.AttendanceRepository;
import com.example.attend.repo.SessionRepository;
import com.example.attend.repo.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor   // ensures repos get injected
public class StaffController {

    private final SessionRepository sessionRepo;
    private final StudentRepository studentRepo;
    private final AttendanceRepository attendanceRepo;

    @Value("${APP_BASE_URL:http://localhost:8080}")
    private String baseUrl;

    // FR1, FR3, FR4, FR5 – Create session
    @PostMapping("/sessions")
    public Map<String, Object> createSession(@RequestBody Map<String, Object> body) {
        Session s = new Session();
        s.setToken(UUID.randomUUID().toString().replace("-", ""));
        s.setCourseCode((String) body.getOrDefault("courseCode", "COURSE"));
        s.setOwnerEmail((String) body.getOrDefault("ownerEmail", "owner@example.com"));

        Instant start = Instant.parse((String) body.get("startTime"));
        Instant end = Instant.parse((String) body.get("endTime"));
        s.setStartTime(start);
        s.setEndTime(end);

        if (body.containsKey("geofenceLat"))
            s.setGeofenceLat(((Number) body.get("geofenceLat")).doubleValue());
        if (body.containsKey("geofenceLng"))
            s.setGeofenceLng(((Number) body.get("geofenceLng")).doubleValue());
        if (body.containsKey("geofenceRadiusMeters"))
            s.setGeofenceRadiusMeters(((Number) body.get("geofenceRadiusMeters")).doubleValue());

        sessionRepo.save(s);

        String link = baseUrl + "/studentcheckin.html?token=" + s.getToken();
        return Map.of("sessionId", s.getId(), "token", s.getToken(), "link", link);
    }

    // FR2 – Roster import
    @PostMapping("/sessions/{id}/roster")
    public ResponseEntity<?> importRoster(@PathVariable("id") Long id,
                                          @RequestBody List<Map<String, String>> rows) {
        System.out.println("📥 Import roster called for sessionId=" + id);
        System.out.println("📦 Incoming rows: " + rows);

        Session s = sessionRepo.findById(id).orElseThrow();

        int savedCount = 0;
        for (Map<String, String> r : rows) {
            System.out.println("➡️ Processing row: " + r);
            Student st = new Student();
            st.setSession(s);
            st.setUsername(r.get("username"));
            st.setStudentId(r.get("studentId"));
            st.setName(r.getOrDefault("name", ""));
            studentRepo.save(st);
            savedCount++;
        }

        System.out.println("✅ Successfully saved " + savedCount + " students");
        return ResponseEntity.ok(Map.of("count", savedCount));
    }

    // ✅ FR13 – List report (fixed with DTOs)
    @GetMapping("/sessions/{id}/report")
    public List<AttendanceReportDTO> report(@PathVariable("id") Long id) {
        Session s = sessionRepo.findById(id).orElseThrow();
        List<Attendance> records = attendanceRepo.findBySession(s);

        return records.stream()
                .map(a -> new AttendanceReportDTO(
                        a.getStudentUsername(),
                        a.getStudentId(),
                        a.getStudentName(),
                        a.getSubmittedAt() != null
                                ? a.getSubmittedAt().atZone(ZoneId.systemDefault()).toLocalDateTime()
                                : null,
                        a.getLat(),
                        a.getLng(),
                        a.getAccuracyMeters(),
                        a.getIpTruncated(),
                        a.getDeviceHash(),
                        a.isFlagLate(),
                        a.isFlagGeofence(),
                        a.isFlagLowAccuracy(),
                        a.getFlagNote()
                ))
                .toList();
    }

    // FR14 – CSV export
    @GetMapping(value = "/sessions/{id}/export.csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv(@PathVariable("id") Long id) {
        Session s = sessionRepo.findById(id).orElseThrow();
        List<Attendance> rows = attendanceRepo.findBySession(s);

        StringBuilder csv = new StringBuilder();
        csv.append("username,studentId,submittedAt,lat,lng,flags\n");
        for (Attendance a : rows) {
            csv.append(a.getStudentUsername()).append(",")
               .append(a.getStudentId()).append(",")
               .append(a.getSubmittedAt()).append(",")
               .append(a.getLat() != null ? a.getLat() : "").append(",")
               .append(a.getLng() != null ? a.getLng() : "").append(",")
               .append(a.getFlagNote() != null ? a.getFlagNote() : "")
               .append("\n");
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=attendance.csv")
                .body(bytes);
    }
}
