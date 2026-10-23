
package cdac.egov.WMS.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cdac.egov.WMS.entities.OthersAudit;

public interface OthersAuditRepository
        extends JpaRepository<OthersAudit, Long> {

    List<OthersAudit> findByOthersIdOrderByTimestampDesc(Long othersId);
}
