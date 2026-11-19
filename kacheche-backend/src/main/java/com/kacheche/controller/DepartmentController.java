package com.kacheche.controller;

import com.kacheche.dto.DepartmentRequest;
import com.kacheche.dto.DepartmentResponse;
import com.kacheche.entity.Department;
import com.kacheche.service.DepartmentCommand;
import com.kacheche.service.DepartmentQuery;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController extends BaseController<
        Department, DepartmentRequest, DepartmentResponse, DepartmentQuery, DepartmentCommand> {

    public DepartmentController(DepartmentQuery query, DepartmentCommand command) {
        super(query, command);
    }
}
