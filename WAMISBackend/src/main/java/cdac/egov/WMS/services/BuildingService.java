package cdac.egov.WMS.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdac.egov.WMS.dto.BuildingRequest;
import cdac.egov.WMS.entities.Building;
import cdac.egov.WMS.entities.BuildingAudit;
import cdac.egov.WMS.entities.DropdownOption;
import cdac.egov.WMS.repositories.BuildingAuditRepository;
import cdac.egov.WMS.repositories.BuildingRepository;
import cdac.egov.WMS.repositories.DropdownOptionRepository;

@Service
public class BuildingService {

    private final BuildingRepository buildings;
    private final BuildingAuditRepository audits;
    private final DropdownOptionRepository options;
    private final JdbcTemplate jdbc;

    public BuildingService(
            BuildingRepository buildings,
            BuildingAuditRepository audits,
            DropdownOptionRepository options,
            JdbcTemplate jdbc) {

        this.buildings = buildings;
        this.audits = audits;
        this.options = options;
        this.jdbc = jdbc;
    }

    public Page<Building> list(int page, int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by("id").descending());

        return buildings.findAll((root, query, cb) ->
                cb.isFalse(root.get("deleted")), pageable);
    }

    public Building get(Long id) {
        return buildings.findById(id)
                .filter(building -> !building.isDeleted())
                .orElseThrow(() ->
                        new IllegalArgumentException("Building not found"));
    }

    @Transactional
    public Building create(BuildingRequest request) {

        validateOptions(request);

        Building building = new Building();
        applyRequest(building, request);
        building.setWorkId(request.workId() == null
                ? jdbc.queryForObject("SELECT nextval('work_id_seq')", Long.class)
                : request.workId());

        Building saved = buildings.saveAndFlush(building);

        audit(saved, "Created", "Initial building record created");
        return saved;
    }

    @Transactional
    public Building update(
            Long id, BuildingRequest request) {

        Building building = get(id);
        validateOptions(request);

        String before = snapshot(building);
        applyRequest(building, request);
        Building saved = buildings.saveAndFlush(building);
        audit(saved, "Updated",
                "Before: " + before + " | After: " + snapshot(saved));

        return saved;
    }

    @Transactional
    public void delete(Long id) {
        Building building = get(id);
        building.setDeleted(true);
        buildings.saveAndFlush(building);
        audit(building, "Deleted", "Record soft-deleted");
    }

    public List<BuildingAudit> auditHistory(Long id) {
        if (!buildings.existsById(id)) {
            throw new IllegalArgumentException("Building not found");
        }
        return audits.findByBuildingIdOrderByTimestampDesc(id);
    }

    public List<DropdownOption> dropdown(String category) {
        return options.findByCategoryAndActiveTrueOrderById(category);
    }


    private void validateOptions(BuildingRequest request) {
        boolean maintenanceValid = options
                .findByCategoryAndActiveTrueOrderById("MAINTENANCE_TYPE")
                .stream()
                .anyMatch(o -> o.getLabel().equals(request.maintenanceType()));

        boolean activityValid = options
                .findByCategoryAndActiveTrueOrderById("BUILDING_ACTIVITY")
                .stream()
                .anyMatch(o -> o.getLabel().equals(request.buildingActivity()));

        if (!maintenanceValid || !activityValid) {
            throw new IllegalArgumentException(
                    "Invalid maintenance type or building activity");
        }
    }

    private void applyRequest(Building b, BuildingRequest r) {
        b.setBuildingDescription(r.buildingDescription());
        b.setBuiltUpArea(r.builtUpArea());
        b.setNumberOfFloors(r.numberOfFloors());
        b.setNumberOfBasements(r.numberOfBasements());
        b.setMaintenanceType(r.maintenanceType());
        b.setBuildingActivity(r.buildingActivity());
    }

    private String snapshot(Building b) {
        return "description=" + b.getBuildingDescription()
                + ", area=" + b.getBuiltUpArea()
                + ", floors=" + b.getNumberOfFloors()
                + ", basements=" + b.getNumberOfBasements()
                + ", maintenanceType=" + b.getMaintenanceType()
                + ", buildingActivity=" + b.getBuildingActivity();
    }

    private void audit(Building b, String remark, String details) {
        audits.save(new BuildingAudit(
                b.getId(),
                remark,
                "System",
                "System",
                "System",
                details));
    }

}

