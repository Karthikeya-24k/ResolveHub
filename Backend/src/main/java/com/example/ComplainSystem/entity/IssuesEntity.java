package com.example.ComplainSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "issues")
public class IssuesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String priority;

    @ManyToOne
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"password", "role"})
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    @JsonIgnoreProperties({"password", "role"})
    private User assignedTo;

    @ManyToOne
    @JoinColumn(name = "assigned_by")
    @JsonIgnoreProperties({"password", "role"})
    private User assignedBy;

}