package com.example.attend.web;


import com.example.attend.model.*;
import com.example.attend.repo.*;
import com.example.attend.service.CheckinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import jakarta.servlet.http.HttpServletRequest;
import java.time.*;
import java.util.*;


@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
private final SessionRepository sessionRepo;
private final StudentRepository studentRepo;
private final CheckinService checkinService;


// FR7–FR12, FR15
@PostMapping("/checkin")
public ResponseEntity<?> checkin(@RequestBody Map<String,Object> body, HttpServletRequest req) {
String token = (String) body.get("token");
String username = (String) body.get("username");
String studentId = (String) body.get("studentId");
Double lat = body.get("lat") == null ? null : ((Number)body.get("lat")).doubleValue();
Double lng = body.get("lng") == null ? null : ((Number)body.get("lng")).doubleValue();
Double accuracy = body.get("accuracy") == null ? null : ((Number)body.get("accuracy")).doubleValue();


Session session = sessionRepo.findByToken(token).orElseThrow();
Student student = studentRepo.findBySessionAndUsername(session, username)
.orElseThrow(() -> new RuntimeException("Unknown student or not on roster"));


String ip = extractIp(req);
String ua = Optional.ofNullable(req.getHeader("User-Agent")).orElse("");


Attendance a = checkinService.createAttendance(session, student, lat, lng, accuracy, ip, ua, Instant.now());


Map<String,Object> res = new HashMap<>();
res.put("ok", true);
res.put("flags", Map.of("late", a.isFlagLate(), "geofence", a.isFlagGeofence(), "lowAccuracy", a.isFlagLowAccuracy()));
res.put("message", a.getFlagNote() == null || a.getFlagNote().isBlank() ? "Attendance recorded" : a.getFlagNote());
return ResponseEntity.ok(res);
}


private static String extractIp(HttpServletRequest req) {
String h = req.getHeader("X-Forwarded-For");
if (h != null && !h.isBlank()) return h.split(",")[0].trim();
return req.getRemoteAddr();
}
}