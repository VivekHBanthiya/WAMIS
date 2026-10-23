
package cdac.egov.WMS.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdac.egov.WMS.dto.OthersRequest;
import cdac.egov.WMS.entities.Others;
import cdac.egov.WMS.entities.OthersAudit;
import cdac.egov.WMS.entities.Unit;
import cdac.egov.WMS.repositories.OthersAuditRepository;
import cdac.egov.WMS.repositories.OthersRepository;
import cdac.egov.WMS.repositories.UnitRepository;

@Service
@Transactional
public class OthersService {

    private final OthersRepository othersRepository;
    private final UnitRepository unitRepository;
    private final OthersAuditRepository auditRepository;

    public OthersService(
            OthersRepository othersRepository,
            UnitRepository unitRepository,
            OthersAuditRepository auditRepository) {
        this.othersRepository = othersRepository;
        this.unitRepository = unitRepository;
        this.auditRepository = auditRepository;
    }

    @Transactional(readOnly = true)
    public Page<Others> list(int page, int size) {
        validatePagination(page, size);

        return othersRepository.findByDeletedFalse(
                PageRequest.of(
                        page, size, Sort.by("id").descending()));
    }

    @Transactional(readOnly = true)
    public Others get(Long id) {
        Others others = othersRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Others record not found: " + id));

        if (others.isDeleted()) {
            throw new IllegalArgumentException(
                    "Others record not found: " + id);
        }

        return others;
    }

    public Others create(OthersRequest request) {
        Others others = new Others();
        applyRequest(others, request);

        Others saved = othersRepository.saveAndFlush(others);
        audit(saved, "Created", "Others record created");

        return saved;
    }

    public Others update(Long id, OthersRequest request) {
        Others others = get(id);

        String before = snapshot(others);
        applyRequest(others, request);

        Others saved = othersRepository.saveAndFlush(others);
        audit(saved, "Updated",
                "Before: " + before + " | After: " + snapshot(saved));

        return saved;
    }

    public void delete(Long id) {
        Others others = get(id);

        others.setDeleted(true);
        Others saved = othersRepository.saveAndFlush(others);

        audit(saved, "Deleted", "Record soft-deleted");
    }

    @Transactional(readOnly = true)
    public List<OthersAudit> auditHistory(Long id) {
        if (!othersRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Others record not found: " + id);
        }

        return auditRepository
                .findByOthersIdOrderByTimestampDesc(id);
    }

    private void audit(Others others, String remark, String details) {
        auditRepository.save(new OthersAudit(
                others.getId(),
                remark,
                "System",
                "System",
                "System",
                details));
    }

    private String snapshot(Others others) {
        return "Description: " + others.getDescription()
                + ", Unit ID: " + others.getUnit().getId()
                + ", Quantity: " + others.getQuantity();
    }

    private void applyRequest(Others others, OthersRequest request) {
        if (request.getDescription() == null
                || request.getDescription().isBlank()) {
            throw new IllegalArgumentException(
                    "Description is required.");
        }

        others.setDescription(request.getDescription().trim());
        others.setQuantity(request.getQuantity());

        Unit unit = unitRepository.findById(request.getUnitId())
                .filter(Unit::isActive)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unit not found or inactive: "
                                + request.getUnitId()));

        others.setUnit(unit);
    }

    private void validatePagination(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page index cannot be negative.");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100.");
        }
    }
}
