package cdac.egov.qmssvr.entities;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "building_audit")
public class BuildingAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long buildingId;

    @Column(nullable = false)
    private String remark;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String employeeName;

    @Column(nullable = false)
    private String designation;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String details;

    protected BuildingAudit() {}

    public BuildingAudit(
            Long buildingId,
            String remark,
            String name,
            String employeeName,
            String designation,
            String details) {
        this.buildingId = buildingId;
        this.remark = remark;
        this.name = name;
        this.employeeName = employeeName;
        this.designation = designation;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getBuildingId() { return buildingId; }
    public String getRemark() { return remark; }
    public String getName() { return name; }
    public String getEmployeeName() { return employeeName; }
    public String getDesignation() { return designation; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getDetails() { return details; }
}
