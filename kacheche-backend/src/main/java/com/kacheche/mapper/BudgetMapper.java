package com.kacheche.mapper;

import com.kacheche.dto.BudgetRequest;
import com.kacheche.dto.BudgetResponse;
import com.kacheche.dto.DepartmentSummaryResponse;
import com.kacheche.entity.Budget;
import com.kacheche.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class BudgetMapper implements EntityMapper<Budget, BudgetRequest, BudgetResponse> {

    @Override
    public Budget toEntity(BudgetRequest r) {
        return new Budget(r.name(), r.fiscalYear(), r.totalAmount(), r.currency(),
                new Department(r.departmentId()));
    }

    @Override
    public BudgetResponse toResponse(Budget b) {
        Department d = b.getDepartment();
        return new BudgetResponse(b.getId(), b.getName(), b.getFiscalYear(),
                b.getTotalAmount(), b.getCurrency(),
                new DepartmentSummaryResponse(d.getId(), d.getName(), d.getCode()),
                b.getVersion());
    }
}
