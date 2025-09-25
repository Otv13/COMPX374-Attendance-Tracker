package com.example.attend.repo;

import com.example.attend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {
    // Custom query method — Spring auto-generates it
    Optional<Session> findByToken(String token);
}
