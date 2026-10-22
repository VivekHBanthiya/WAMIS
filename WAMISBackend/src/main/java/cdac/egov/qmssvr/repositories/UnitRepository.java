package cdac.egov.qmssvr.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import cdac.egov.qmssvr.entities.Unit;

public interface UnitRepository extends JpaRepository<Unit, Long> {

    List<Unit> findByActiveTrueOrderByShortNameAsc();
}