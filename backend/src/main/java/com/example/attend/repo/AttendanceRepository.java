package com.example.attend.repo;

import com.example.attend.model.Attendance;
import com.example.attend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findBySession(Session session);
}
