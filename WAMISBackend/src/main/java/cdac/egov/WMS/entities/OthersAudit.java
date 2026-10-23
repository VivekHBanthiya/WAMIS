
package cdac.egov.WMS.entities;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "others_audit")
public class OthersAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long othersId;

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

    protected OthersAudit() {}

    public OthersAudit(
            Long othersId,
            String remark,
            String name,
            String employeeName,
            String designation,
            String details) {
        this.othersId = othersId;
        this.remark = remark;
        this.name = name;
        this.employeeName = employeeName;
        this.designation = designation;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getOthersId() { return othersId; }
    public String getRemark() { return remark; }
    public String getName() { return name; }
    public String getEmployeeName() { return employeeName; }
    public String getDesignation() { return designation; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getDetails() { return details; }
}
