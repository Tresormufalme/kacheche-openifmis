
package com.kacheche.service;

import com.kacheche.entity.Department;
import com.kacheche.repository.DepartmentRepository;

import com.kacheche.exception.ResourceNotFoundException;
import com.kacheche.exception.DuplicateResourceException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    // Injection de dépendance par constructeur
    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    // 1. Créer un département
    public Department create(Department department) {

        if (departmentRepository.existsByCode(department.getCode())) {
            throw new DuplicateResourceException(
                    "Ce code de département existe déjà."
            );
        }

        return departmentRepository.save(department);
    }

    // 2. Récupérer tous les départements
    @Transactional(readOnly = true)
    public List<Department> findAll() {
        return departmentRepository.findAll();
    }

    // 3. Rechercher un département par son ID
    @Transactional(readOnly = true)
    public Department findById(Long id) {

        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Département introuvable avec l'ID : " + id
                ));
    }

    // 4. Modifier un département
    public Department update(Long id, Department updatedDepartment) {

        Department existingDepartment = findById(id);

        departmentRepository.findByCode(updatedDepartment.getCode())
                .ifPresent(found -> {
                    if (!found.getId().equals(id)) {
                        throw new DuplicateResourceException(
                                "Ce code est déjà utilisé par un autre département."
                        );
                    }
                });

        existingDepartment.setName(updatedDepartment.getName());
        existingDepartment.setCode(updatedDepartment.getCode());
        existingDepartment.setDescription(
                updatedDepartment.getDescription()
        );

        return departmentRepository.save(existingDepartment);
    }

    // 5. Supprimer un département
    public void delete(Long id) {

        Department department = findById(id);

        departmentRepository.delete(department);
    }
}
