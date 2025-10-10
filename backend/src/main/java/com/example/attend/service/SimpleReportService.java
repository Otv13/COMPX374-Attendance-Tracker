package com.example.attend.service;

import com.example.attend.dto.SimpleAttendanceRow;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;

@Service
public class SimpleReportService {

    @PersistenceContext
    private EntityManager em;

    public Page<SimpleAttendanceRow> pageForSession(Long sessionId, boolean privacy, int page, int size) {

        String jpql =
            "SELECT new com.example.attend.dto.SimpleAttendanceRow(" +
            "  a.id, s.id, a.studentUsername, a.studentId, a.submittedAt, " +
            "  a.flagLate, a.flagGeofence, a.flagLowAccuracy, a.flagNote" +
            ") " +
            "FROM Attendance a " +
            "JOIN a.session s " +
            "WHERE s.id = :sid " +
            "ORDER BY a.submittedAt DESC";

        String countJpql =
            "SELECT COUNT(a) FROM Attendance a JOIN a.session s WHERE s.id = :sid";

        int p = Math.max(page, 0);
        int sz = Math.max(size, 1);

        TypedQuery<SimpleAttendanceRow> q = em.createQuery(jpql, SimpleAttendanceRow.class)
                .setParameter("sid", sessionId)
                .setFirstResult(p * sz)
                .setMaxResults(sz);

        Long total = em.createQuery(countJpql, Long.class)
                .setParameter("sid", sessionId)
                .getSingleResult();

        List<SimpleAttendanceRow> list = q.getResultList();

        if (privacy && !list.isEmpty()) {
            List<SimpleAttendanceRow> hashed = new ArrayList<>(list.size());
            for (SimpleAttendanceRow r : list) {
                String uname = anonymise(r.username);
                String sid   = anonymise(r.studentId);
                hashed.add(new SimpleAttendanceRow(
                        r.attendanceId, r.sessionId, uname, sid,
                        r.timestamp, r.late, r.geofence, r.lowAccuracy, r.note
                ));
            }
            list = hashed;
        }

        return new PageImpl<>(list, PageRequest.of(p, sz), total);
    }

    private String anonymise(String s) {
        if (s == null) return null;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] dig = md.digest(s.getBytes(StandardCharsets.UTF_8));
            return "id_" + bytesToHex(dig).substring(0, 10);
        } catch (Exception e) {
            return "id_x";
        }
    }

    private static String bytesToHex(byte[] bytes) {
        char[] hexArray = "0123456789abcdef".toCharArray();
        char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2]     = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }
}
