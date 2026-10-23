package cdac.egov.WMS.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record BuildingRequest(
	    Long workId,
	    @NotBlank @Size(max = 1000) String buildingDescription,
	    @NotNull @DecimalMin("0.0") BigDecimal builtUpArea,
	    @NotNull @Min(0) Integer numberOfFloors,
	    @NotNull @Min(0) Integer numberOfBasements,
	    @NotBlank String maintenanceType,
	    @NotBlank String buildingActivity
	) {}
