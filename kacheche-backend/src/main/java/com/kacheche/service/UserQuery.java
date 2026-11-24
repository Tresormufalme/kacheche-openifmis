package com.kacheche.service;

import com.kacheche.dto.UserResponse;
import com.kacheche.entity.User;
import com.kacheche.mapper.UserMapper;
import com.kacheche.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserQuery extends BaseQuery<User, UserResponse, UserRepository> {

    public UserQuery(final UserRepository repository, final UserMapper mapper) {
        super(repository, mapper, "Utilisateur");
    }
}
