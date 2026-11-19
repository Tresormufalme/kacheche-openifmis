package com.kacheche.repository;

import com.kacheche.entity.Department;

import java.util.Optional;

public interface DepartmentRepository extends BaseRepository<Department> {

    Optional<Department> findByCode(String code);

    boolean existsByCode(String code);
}
