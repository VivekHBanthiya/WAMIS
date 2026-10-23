package cdac.egov.WMS.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cdac.egov.WMS.entities.DropdownOption;

public interface DropdownOptionRepository
        extends JpaRepository<DropdownOption, Long> {

    List<DropdownOption> findByCategoryAndActiveTrueOrderById(
            String category);
}
