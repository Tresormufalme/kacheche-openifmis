package com.kacheche.service;

import com.kacheche.dto.BudgetRequest;
import com.kacheche.entity.Budget;
import com.kacheche.exception.DuplicateResourceException;
import com.kacheche.exception.ResourceNotFoundException;
import com.kacheche.mapper.BudgetMapper;
import com.kacheche.repository.BudgetRepository;
import com.kacheche.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

@Service
public class BudgetCommand extends BaseCommand<Budget, BudgetRequest, BudgetRepository> {

    private final DepartmentRepository departmentRepository;

    public BudgetCommand(final BudgetRepository repository,
                         final BudgetMapper mapper,
                         final DepartmentRepository departmentRepository) {
        super(repository, mapper, "Budget");
        this.departmentRepository = departmentRepository;
    }

    @Override
    protected void prepare(Budget budget) {
        Long departmentId = budget.getDepartment().getId();
        budget.setDepartment(departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Département introuvable : " + departmentId)));
    }

    @Override
    protected void validateCreate(Budget budget) {
        if (repository.existsByNameAndFiscalYear(budget.getName(), budget.getFiscalYear())) {
            throw new DuplicateResourceException(
                    "Un budget portant ce nom existe déjà pour cette année.");
        }
    }

    @Override
    protected void validateUpdate(Budget existing, Budget incoming) {
        repository.findByNameAndFiscalYear(incoming.getName(), incoming.getFiscalYear())
                .filter(found -> !found.getId().equals(existing.getId()))
                .ifPresent(found -> {
                    throw new DuplicateResourceException(
                            "Un autre budget porte déjà ce nom pour cette année.");
                });
    }

    @Override
    protected void copy(Budget target, Budget source) {
        target.setName(source.getName());
        target.setFiscalYear(source.getFiscalYear());
        target.setTotalAmount(source.getTotalAmount());
        target.setCurrency(source.getCurrency());
        target.setDepartment(source.getDepartment());
    }
}
