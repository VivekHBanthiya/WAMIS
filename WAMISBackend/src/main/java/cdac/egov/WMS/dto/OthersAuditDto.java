package cdac.egov.WMS.dto;

import java.time.LocalDateTime;

public class OthersAuditDto {

    private String remark;
    private String name;
    private String employeeName;
    private String designation;
    private LocalDateTime timestamp;

    public OthersAuditDto() {}

    public OthersAuditDto(
            String remark,
            String name,
            String employeeName,
            String designation,
            LocalDateTime timestamp) {
        this.remark = remark;
        this.name = name;
        this.employeeName = employeeName;
        this.designation = designation;
        this.timestamp = timestamp;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

