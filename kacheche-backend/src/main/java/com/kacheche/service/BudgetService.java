
package com.kacheche.service;

import com.kacheche.entity.Budget;
import com.kacheche.entity.Department;
import com.kacheche.exception.DuplicateResourceException;
import com.kacheche.exception.ResourceNotFoundException;
import com.kacheche.repository.BudgetRepository;
import com.kacheche.repository.DepartmentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import com.kacheche.dto.BudgetResponse;
import com.kacheche.dto.DepartmentSummaryResponse;

@Service
@Transactional
public class BudgetService implements CrudService<Budget, Long> {

    private final BudgetRepository budgetRepository;
    private final DepartmentRepository departmentRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            DepartmentRepository departmentRepository) {

        this.budgetRepository = budgetRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    public Budget create(Budget budget) {

        Department department = getDepartment(
                budget.getDepartment().getId()
        );

        boolean alreadyExists =
                budgetRepository.existsByNameAndFiscalYear(
                        budget.getName(),
                        budget.getFiscalYear()
                );

        if (alreadyExists) {
            throw new DuplicateResourceException(
                    "Un budget portant ce nom existe déjà pour cette année."
            );
        }

        budget.setDepartment(department);

        return budgetRepository.save(budget);
    }

    @Override
    @Transactional(readOnly = true)
    public Budget findById(Long id) {

        return budgetRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Budget introuvable avec l'identifiant : " + id
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Budget> findAll() {
        return budgetRepository.findAll();
    }

    @Override
    public Budget update(Long id, Budget budget) {

        Budget existingBudget = findById(id);

        Department department = getDepartment(
                budget.getDepartment().getId()
        );

        Optional<Budget> duplicate =
                budgetRepository.findByNameAndFiscalYear(
                        budget.getName(),
                        budget.getFiscalYear()
                );

        if (duplicate.isPresent()
                && !duplicate.get().getId().equals(id)) {

            throw new DuplicateResourceException(
                    "Un autre budget porte déjà ce nom pour cette année."
            );
        }

        existingBudget.setName(budget.getName());
        existingBudget.setFiscalYear(budget.getFiscalYear());
        existingBudget.setTotalAmount(budget.getTotalAmount());
        existingBudget.setCurrency(budget.getCurrency());
        existingBudget.setDepartment(department);

        return budgetRepository.save(existingBudget);
    }

    @Override
    public void delete(Long id) {

        Budget budget = findById(id);

        budgetRepository.delete(budget);
    }

    @Transactional(readOnly = true)
    public List<Budget> findByFiscalYear(Integer fiscalYear) {
        return budgetRepository.findByFiscalYear(fiscalYear);
    }

    @Transactional(readOnly = true)
    public List<Budget> findByDepartmentId(Long departmentId) {

        return budgetRepository.findByDepartmentId(departmentId);
    }

    private Department getDepartment(Long departmentId) {

        return departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Département introuvable : " + departmentId
                        )
                );
    }

    // ==========================================
// CONVERSION ENTITY -> DTO
// ==========================================

    private BudgetResponse mapToResponse(Budget budget) {

        Department department = budget.getDepartment();

        DepartmentSummaryResponse departmentResponse =
                new DepartmentSummaryResponse(
                        department.getId(),
                        department.getName(),
                        department.getCode()
                );

        return new BudgetResponse(
                budget.getId(),
                budget.getName(),
                budget.getFiscalYear(),
                budget.getTotalAmount(),
                budget.getCurrency(),
                departmentResponse
        );
    }

// ==========================================
// MÉTHODES DE RÉPONSE API
// ==========================================

    @Transactional(readOnly = true)
    public List<BudgetResponse> findAllResponses() {

        return budgetRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BudgetResponse findResponseById(Long id) {

        Budget budget = findById(id);

        return mapToResponse(budget);
    }

    public BudgetResponse createResponse(Budget budget) {

        Budget createdBudget = create(budget);

        return mapToResponse(createdBudget);
    }

    public BudgetResponse updateResponse(Long id, Budget budget) {

        Budget updatedBudget = update(id, budget);

        return mapToResponse(updatedBudget);
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> findResponsesByFiscalYear(Integer year) {

        return budgetRepository.findByFiscalYear(year)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> findResponsesByDepartment(Long departmentId) {

        return budgetRepository.findByDepartmentId(departmentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}
