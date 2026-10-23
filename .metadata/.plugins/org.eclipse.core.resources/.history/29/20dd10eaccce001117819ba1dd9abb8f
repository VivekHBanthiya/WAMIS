package cdac.egov.WMS.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.*;

public record BuildingRequest(
    @NotBlank @Size(max = 1000) String buildingDescription,
    @NotNull @DecimalMin("0.0") BigDecimal builtUpArea,
    @NotNull @Min(0) Integer numberOfFloors,
    @NotNull @Min(0) Integer numberOfBasements,
    @NotBlank String maintenanceType,
    @NotBlank String buildingActivity
) {}
