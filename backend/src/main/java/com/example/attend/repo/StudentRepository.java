package com.example.attend.repo;

import com.example.attend.model.Session;
import com.example.attend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    // Custom finder the spring will generate the query automatically
    Optional<Student> findBySessionAndUsername(Session session, String username);
}
