
package cdac.egov.WMS.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.envers.Audited;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "buildings")
@Audited
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "work_id", nullable = false, updatable = false)
    private Long workId;

    @NotBlank
    @Size(max = 1000)
    @Column(nullable = false, length = 1000)
    private String buildingDescription;

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal builtUpArea;

    @NotNull
    @Column(nullable = false)
    private Integer numberOfFloors;

    @NotNull
    @Column(nullable = false)
    private Integer numberOfBasements;

    @NotBlank
    @Column(nullable = false)
    private String maintenanceType;

    @NotBlank
    @Column(nullable = false)
    private String buildingActivity;

    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Building() {}

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getWorkId() { return workId; }
    public String getBuildingDescription() { return buildingDescription; }
    public BigDecimal getBuiltUpArea() { return builtUpArea; }
    public Integer getNumberOfFloors() { return numberOfFloors; }
    public Integer getNumberOfBasements() { return numberOfBasements; }
    public String getMaintenanceType() { return maintenanceType; }
    public String getBuildingActivity() { return buildingActivity; }
    public boolean isDeleted() { return deleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setWorkId(Long workId) { this.workId = workId; }
    public void setBuildingDescription(String value) {
        this.buildingDescription = value;
    }
    public void setBuiltUpArea(BigDecimal value) {
        this.builtUpArea = value;
    }
    public void setNumberOfFloors(Integer value) {
        this.numberOfFloors = value;
    }
    public void setNumberOfBasements(Integer value) {
        this.numberOfBasements = value;
    }
    public void setMaintenanceType(String value) {
        this.maintenanceType = value;
    }
    public void setBuildingActivity(String value) {
        this.buildingActivity = value;
    }
    public void setDeleted(boolean value) { this.deleted = value; }
}
