package com.kacheche.service;

import com.kacheche.dto.DepartmentResponse;
import com.kacheche.entity.Department;
import com.kacheche.mapper.DepartmentMapper;
import com.kacheche.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

@Service
public class DepartmentQuery extends BaseQuery<Department, DepartmentResponse, DepartmentRepository> {

    public DepartmentQuery(final DepartmentRepository repository, final DepartmentMapper mapper) {
        super(repository, mapper, "Département");
    }
}
