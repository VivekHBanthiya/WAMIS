package cdac.egov.WMS.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import cdac.egov.WMS.entities.Building;

public interface BuildingRepository extends
        JpaRepository<Building, Long>,
        JpaSpecificationExecutor<Building> {
}
        