package cdac.egov.WMS.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import cdac.egov.WMS.entities.Others;

public interface OthersRepository extends JpaRepository<Others, Long> {

    Page<Others> findByDeletedFalse(Pageable pageable);
}