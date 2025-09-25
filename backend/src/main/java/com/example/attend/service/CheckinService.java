package com.example.attend.service;

import com.example.attend.model.Attendance;
import com.example.attend.model.Session;
import com.example.attend.model.Student;
import com.example.attend.repo.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.security.MessageDigest;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CheckinService {

    private final AttendanceRepository attendanceRepo;

    @Value("${app.accuracy.threshold:100}")
    private double accuracyThreshold;

    public Attendance createAttendance(Session session, Student student,
                                       Double lat, Double lng, Double accuracy,
                                       String ip, String userAgent, Instant now) {
        Attendance a = new Attendance();
        a.setSession(session);
        a.setStudentUsername(student.getUsername());
        a.setStudentId(student.getStudentId());
        a.setStudentName(student.getName());
        a.setSubmittedAt(now);
        a.setLat(lat);
        a.setLng(lng);
        a.setAccuracyMeters(accuracy);

        a.setIpTruncated(truncateIp(ip));
        a.setDeviceHash(hash(userAgent + "|" + a.getIpTruncated()));

        // Late flag (null-safe)
        boolean late = false;
        if (session.getStartTime() != null && session.getEndTime() != null) {
            late = now.isBefore(session.getStartTime()) || now.isAfter(session.getEndTime());
        }
        a.setFlagLate(late);

        // Accuracy flag
        boolean lowAcc = (accuracy != null) && accuracy > accuracyThreshold;
        a.setFlagLowAccuracy(lowAcc);

        // Geofence flag
        boolean geofence = false;
        if (session.getGeofenceLat() != null && session.getGeofenceLng() != null && lat != null && lng != null) {
            double d = haversineMeters(session.getGeofenceLat(), session.getGeofenceLng(), lat, lng);
            double radius = session.getGeofenceRadiusMeters() != null ? session.getGeofenceRadiusMeters() : 150.0;
            geofence = d > radius;
        }
        a.setFlagGeofence(geofence);

        // Note builder
        StringBuilder sb = new StringBuilder();
        if (late) sb.append("Late/Outside time window. ");
        if (lowAcc) sb.append("Low accuracy > ").append(accuracyThreshold).append("m. ");
        if (geofence) sb.append("Outside geofence.");
        a.setFlagNote(sb.toString());

        return attendanceRepo.save(a);
    }

    // Helper functions
    private static double haversineMeters(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371000.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2)*Math.sin(dLat/2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon/2)*Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private static String truncateIp(String ip) {
        try {
            InetAddress addr = InetAddress.getByName(ip);
            byte[] bytes = addr.getAddress();
            if (bytes.length == 4) { // IPv4 -> /24
                return (bytes[0] & 0xFF) + "." + (bytes[1] & 0xFF) + "." + (bytes[2] & 0xFF) + ".0/24";
            } else { // IPv6 -> /64
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < 8; i += 2) {
                    int hi = bytes[i] & 0xFF, lo = bytes[i+1] & 0xFF;
                    sb.append(Integer.toHexString((hi<<8)|lo));
                    if (i < 6) sb.append(":");
                }
                sb.append("::/64");
                return sb.toString();
            }
        } catch (Exception e) {
            return "unknown";
        }
    }

    private static String hash(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(s.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));  // ✅ manual hex encoding
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
