package com.kacheche.mapper;

import com.kacheche.dto.DepartmentRequest;
import com.kacheche.dto.DepartmentResponse;
import com.kacheche.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper implements EntityMapper<Department, DepartmentRequest, DepartmentResponse> {

    @Override
    public Department toEntity(DepartmentRequest r) {
        return new Department(r.name(), r.code(), r.description());
    }

    @Override
    public DepartmentResponse toResponse(Department d) {
        return new DepartmentResponse(d.getId(), d.getName(), d.getCode(),
                d.getDescription(), d.getVersion());
    }
}
