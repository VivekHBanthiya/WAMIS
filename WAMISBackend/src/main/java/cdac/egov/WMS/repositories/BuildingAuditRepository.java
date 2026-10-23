package cdac.egov.WMS.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cdac.egov.WMS.entities.BuildingAudit;

public interface BuildingAuditRepository
        extends JpaRepository<BuildingAudit, Long> {

    List<BuildingAudit> findByBuildingIdOrderByTimestampDesc(Long buildingId);
}
