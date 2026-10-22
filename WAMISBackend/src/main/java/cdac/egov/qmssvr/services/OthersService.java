package cdac.egov.qmssvr.services;

import java.util.List;

import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdac.egov.qmssvr.dto.OthersRequest;
import cdac.egov.qmssvr.entities.Others;
import cdac.egov.qmssvr.entities.Unit;
import cdac.egov.qmssvr.repositories.OthersRepository;
import cdac.egov.qmssvr.repositories.UnitRepository;

import jakarta.persistence.EntityManager;

@Service
@Transactional
public class OthersService {

    private final OthersRepository othersRepository;
    private final UnitRepository unitRepository;
    private final EntityManager entityManager;

    public OthersService(
            OthersRepository othersRepository,
            UnitRepository unitRepository,
            EntityManager entityManager) {
        this.othersRepository = othersRepository;
        this.unitRepository = unitRepository;
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public Page<Others> list(int page, int size) {
        validatePagination(page, size);

        return othersRepository.findByDeletedFalse(
                PageRequest.of(page, size, Sort.by("id").descending()));
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
        return othersRepository.save(others);
    }

    public Others update(Long id, OthersRequest request) {
        Others others = get(id);
        applyRequest(others, request);
        return othersRepository.save(others);
    }

    public void delete(Long id) {
        Others others = get(id);
        others.setDeleted(true);
        othersRepository.save(others);
    }

    @Transactional(readOnly = true)
    public List<Others> auditHistory(Long id) {
        get(id);

        AuditReader reader = AuditReaderFactory.get(entityManager);

        return reader.createQuery()
                .forRevisionsOfEntity(Others.class, true, false)
                .add(AuditEntity.id().eq(id))
                .addOrder(AuditEntity.revisionNumber().desc())
                .getResultList();
    }

    private void applyRequest(Others others, OthersRequest request) {
        others.setDescription(request.getDescription().trim());
        others.setQuantity(request.getQuantity());

        Unit unit = unitRepository.findById(request.getUnitId())
                .filter(Unit::isActive)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unit not found or inactive: " + request.getUnitId()));

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