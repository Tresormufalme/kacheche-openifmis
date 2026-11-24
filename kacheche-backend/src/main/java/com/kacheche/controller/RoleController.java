package com.kacheche.controller;

import com.kacheche.dto.RoleRequest;
import com.kacheche.dto.RoleResponse;
import com.kacheche.entity.Role;
import com.kacheche.service.RoleCommand;
import com.kacheche.service.RoleQuery;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
public class RoleController extends BaseController<
        Role, RoleRequest, RoleResponse, RoleQuery, RoleCommand> {

    public RoleController(RoleQuery query, RoleCommand command) {
        super(query, command);
    }
}
