package com.example.attend.model;


import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
    name = "student",
    indexes = {
        @Index(columnList = "username"),
        @Index(columnList = "studentId")
    }
)
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String studentId;
    private String name;

    @ManyToOne(optional = false)
    private com.example.attend.model.Session session;
}
