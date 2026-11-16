
package com.kacheche.repository;

import com.kacheche.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

    // Rechercher un département par son code
    Optional<Department> findByCode(String code);

    // Vérifier si un code existe déjà
    boolean existsByCode(String code);
}
