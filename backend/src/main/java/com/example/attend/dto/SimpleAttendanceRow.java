package com.example.attend.dto;
import java.time.Instant;

/**
 * Minimal DTO for the Simple Report API
 */
public class SimpleAttendanceRow { 
    public Long attendanceId;      
    public Long sessionId;         
    public String username;        
    public String studentId;       
    public Instant timestamp;      
    public boolean late;           
    public boolean geofence;       
    public boolean lowAccuracy;    
    public String note;            

    // no-args ctor needed by serializers
    public SimpleAttendanceRow() {}

    // all-args ctor for convenience
    public SimpleAttendanceRow(Long attendanceId,
                               Long sessionId,
                               String username,
                               String studentId,
                               Instant timestamp,
                               boolean late,
                               boolean geofence,
                               boolean lowAccuracy,
                               String note) {
        this.attendanceId = attendanceId;
        this.sessionId = sessionId;
        this.username = username;
        this.studentId = studentId;
        this.timestamp = timestamp;
        this.late = late;
        this.geofence = geofence;
        this.lowAccuracy = lowAccuracy;
        this.note = note;
    }
}