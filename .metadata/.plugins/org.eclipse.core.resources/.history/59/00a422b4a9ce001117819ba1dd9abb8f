package cdac.egov.qmssvr.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import cdac.egov.qmssvr.dto.OthersRequest;
import cdac.egov.qmssvr.entities.Others;
import cdac.egov.qmssvr.services.OthersService;
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
    public List<Others> audit(@PathVariable Long id) {
        return service.auditHistory(id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(
                Map.of("message", exception.getMessage()));
    }
}