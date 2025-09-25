package com.example.attend.model;


import jakarta.persistence.*;
import lombok.*;


@Entity @Getter @Setter @NoArgsConstructor
@Table(indexes = {@Index(columnList = "username"), @Index(columnList = "studentId")})
public class Student {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;


private String username; // FR2/FR7
private String studentId; // FR2/FR7
private String name; // FR2


@ManyToOne(optional = false)
private com.example.attend.model.Session session;
}