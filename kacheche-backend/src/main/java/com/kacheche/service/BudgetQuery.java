package com.kacheche.service;

import com.kacheche.dto.BudgetResponse;
import com.kacheche.entity.Budget;
import com.kacheche.mapper.BudgetMapper;
import com.kacheche.repository.BudgetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetQuery extends BaseQuery<Budget, BudgetResponse, BudgetRepository> {

    public BudgetQuery(final BudgetRepository repository, final BudgetMapper mapper) {
        super(repository, mapper, "Budget");
    }

    public List<BudgetResponse> findByFiscalYear(Integer year) {
        return toResponses(repository.findByFiscalYear(year));
    }

    public List<BudgetResponse> findByDepartmentId(Long departmentId) {
        return toResponses(repository.findByDepartmentId(departmentId));
    }
}
