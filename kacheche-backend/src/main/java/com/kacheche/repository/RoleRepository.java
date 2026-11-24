package com.kacheche.repository;

import com.kacheche.entity.Role;

import java.util.Optional;

public interface RoleRepository extends BaseRepository<Role> {

    Optional<Role> findByName(String name);

    boolean existsByNameIgnoreCase(String name);
}
