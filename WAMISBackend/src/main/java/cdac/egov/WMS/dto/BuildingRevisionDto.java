package cdac.egov.WMS.dto;

import java.time.Instant;
import java.util.Map;

public record BuildingRevisionDto(
        Long revisionId,
        Instant timestamp,
        String revisionType,
        Map<String, Object> building
) {}

