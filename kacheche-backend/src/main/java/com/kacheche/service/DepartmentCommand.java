package com.kacheche.service;

import com.kacheche.dto.DepartmentRequest;
import com.kacheche.entity.Department;
import com.kacheche.exception.DuplicateResourceException;
import com.kacheche.mapper.DepartmentMapper;
import com.kacheche.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

@Service
public class DepartmentCommand extends BaseCommand<Department, DepartmentRequest, DepartmentRepository> {

    public DepartmentCommand(final DepartmentRepository repository, final DepartmentMapper mapper) {
        super(repository, mapper, "Département");
    }

    @Override
    protected void validateCreate(Department department) {
        if (repository.existsByCode(department.getCode())) {
            throw new DuplicateResourceException("Ce code de département existe déjà.");
        }
    }

    @Override
    protected void validateUpdate(Department existing, Department incoming) {
        repository.findByCode(incoming.getCode()).ifPresent(found -> {
            if (!found.getId().equals(existing.getId())) {
                throw new DuplicateResourceException(
                        "Ce code est déjà utilisé par un autre département.");
            }
        });
    }

    @Override
    protected void copy(Department target, Department source) {
        target.setName(source.getName());
        target.setCode(source.getCode());
        target.setDescription(source.getDescription());
    }
}
