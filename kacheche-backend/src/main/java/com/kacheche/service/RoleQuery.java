package com.kacheche.service;

import com.kacheche.dto.RoleResponse;
import com.kacheche.entity.Role;
import com.kacheche.mapper.RoleMapper;
import com.kacheche.repository.RoleRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleQuery extends BaseQuery<Role, RoleResponse, RoleRepository> {

    public RoleQuery(final RoleRepository repository, final RoleMapper mapper) {
        super(repository, mapper, "Rôle");
    }
}
