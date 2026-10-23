package cdac.egov.WMS.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cdac.egov.WMS.entities.DropdownOption;
import org.springframework.data.jpa.repository.Query;

public interface DropdownOptionRepository
        extends JpaRepository<DropdownOption, Long> {

    @Query("SELECT d FROM DropdownOption d WHERE d.category = :category AND d.active = TRUE ORDER BY d.id asc")
	List<DropdownOption> findByCategoryAndActiveTrueOrderById(
            String category);
}
