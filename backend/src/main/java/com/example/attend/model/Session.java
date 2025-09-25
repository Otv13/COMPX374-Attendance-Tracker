package com.example.attend.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.*;


@Entity @Getter @Setter @NoArgsConstructor
public class Session {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;


@Column(unique = true)
private String token; // FR3 unique link token


private String courseCode; // FR5
private String ownerEmail; // FR5


private Instant startTime; // FR1
private Instant endTime; // FR1


private Double geofenceLat; // FR4a
private Double geofenceLng; // FR4a
private Double geofenceRadiusMeters; // FR4a


@OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Student> roster = new ArrayList<>();
}
