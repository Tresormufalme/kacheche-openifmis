
package com.kacheche.repository;
import java.util.Optional;

import com.kacheche.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByFiscalYear(Integer fiscalYear);

    List<Budget> findByDepartmentId(Long departmentId);

    boolean existsByNameAndFiscalYear(
            String name,
            Integer fiscalYear
    );
    Optional<Budget> findByNameAndFiscalYear(
            String name,
            Integer fiscalYear
    );
}
