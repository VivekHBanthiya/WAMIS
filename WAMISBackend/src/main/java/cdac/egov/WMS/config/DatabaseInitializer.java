package cdac.egov.WMS.config;


import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import cdac.egov.WMS.entities.DropdownOption;
import cdac.egov.WMS.entities.Unit;
import cdac.egov.WMS.repositories.DropdownOptionRepository;
import cdac.egov.WMS.repositories.UnitRepository;

@Configuration
public class DatabaseInitializer {

    @Bean
    ApplicationRunner initializeDatabase(
            JdbcTemplate jdbc,
            DropdownOptionRepository dropdownRepository,
            UnitRepository unitRepository) {

        return args -> {
            jdbc.execute(
                "CREATE SEQUENCE IF NOT EXISTS work_id_seq START WITH 1");
            jdbc.execute(
                "CREATE SEQUENCE IF NOT EXISTS subwork_id_seq START WITH 1");

            addOption(dropdownRepository, "MAINTENANCE_TYPE",
                    "CR (Current Repair)");
            addOption(dropdownRepository, "MAINTENANCE_TYPE",
                    "SLR (Special Repair)");
            addOption(dropdownRepository, "MAINTENANCE_TYPE",
                    "SDR (Specified Repair)");

            addOption(dropdownRepository, "BUILDING_ACTIVITY",
                    "New Construction");
            addOption(dropdownRepository, "BUILDING_ACTIVITY",
                    "Other Activities From PMIS");

            addUnits(unitRepository);
        };
    }

    private void addUnits(UnitRepository repository) {
        String[][] units = {
            {"sqm", "Square Metre"},
            {"kg", "Kilo Gram"},
            {"each", "each"},
            {"quintal", "Quintal"},
            {"cum", "Cubic Metre"},
            {"NA", "Not Applicable"},
            {"BAG", "BAGS"},
            {"BKL", "BUCKLES"},
            {"BOU", "BOU"},
            {"BOX", "BOX"},
            {"BTL", "BOTTLES"},
            {"BUN", "BUNCHES"},
            {"CCM", "CUBIC CENTIMETER"},
            {"CIN", "CUBIC INCHES"},
            {"CMS", "CENTIMETER"},
            {"CQM", "CUBIC METERS"},
            {"DOZ", "DOZEN"},
            {"GMS", "GRAMS"},
            {"INC", "INCHES"},
            {"KM", "KILOMETERS"},
            {"PAC", "PACKS"},
            {"SHT", "SHEETS"},
            {"TOL", "TOLA"},
            {"HRS", "HOURS"},
            {"qty", "Quantity"},
            {"Nos", "Numbers"},
            {"MT", "Matric ton"},
            {"Day", "Per Day"},
            {"RMT", "Running Meter"},
            {"LS", "LUMPSUM"},
            {"HECT", "HECTRE"},
            {"ACR", "ACRE"}
        };

        for (String[] unit : units) {
            Unit existing = repository.findByShortName(unit[0]).orElse(null);
            if (existing == null) {
                repository.save(new Unit(unit[0], unit[1]));
            } else if (!existing.isActive()
                    || !existing.getDescription().equals(unit[1])) {
                existing.setActive(true);
                existing.setDescription(unit[1]);
                repository.save(existing);
            }
        }
    }

    private void addOption(
            DropdownOptionRepository repository,
            String category,
            String label) {

        boolean exists = repository
                .findByCategoryAndActiveTrueOrderById(category)
                .stream()
                .anyMatch(option -> option.getLabel().equals(label));

        if (!exists) {
            repository.save(new DropdownOption(category, label));
        }
    }
}
