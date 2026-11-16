
package com.kacheche.entity;

import jakarta.persistence.*;
import org.hibernate.envers.Audited;

@Audited
@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(length = 500)
    private String description;

    // Constructeur sans argument requis par JPA
    public Department() {
    }

    // Constructeur pour créer facilement un département
    public Department(String name, String code, String description) {
        this.name = name;
        this.code = code;
        this.description = description;
    }

    //constructeur 03
    public Department(Long id) {
        this.id = id;
    }

    // Getters et setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
