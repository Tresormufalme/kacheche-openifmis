package com.kacheche.repository;

import com.kacheche.entity.Budget;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends BaseRepository<Budget> {

    List<Budget> findByFiscalYear(Integer fiscalYear);

    List<Budget> findByDepartmentId(Long departmentId);

    boolean existsByNameAndFiscalYear(String name, Integer fiscalYear);

    Optional<Budget> findByNameAndFiscalYear(String name, Integer fiscalYear);
}
