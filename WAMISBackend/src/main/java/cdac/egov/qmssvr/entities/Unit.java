package cdac.egov.qmssvr.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "units")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "short_name", nullable = false, unique = true, length = 30)
    private String shortName;

    @Column(nullable = false, length = 100)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    public Unit() {}

    public Unit(String shortName, String description) {
        this.shortName = shortName;
        this.description = description;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
