package cdac.egov.WMS.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cdac.egov.WMS.dto.OthersRequest;
import cdac.egov.WMS.entities.Others;
import cdac.egov.WMS.entities.OthersAudit;
import cdac.egov.WMS.services.OthersService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/others")
@CrossOrigin(origins = "http://localhost:4200")
public class OthersController {

    private final OthersService service;

    public OthersController(OthersService service) {
        this.service = service;
    }

    @GetMapping
    public Page<Others> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return service.list(page, size);
    }

    @GetMapping("/{id}")
    public Others get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public Others create(@Valid @RequestBody OthersRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public Others update(
            @PathVariable Long id,
            @Valid @RequestBody OthersRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/audit")
    public List<OthersAudit> audit(@PathVariable Long id) {
        return service.auditHistory(id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(
                Map.of("message", exception.getMessage()));
    }
}