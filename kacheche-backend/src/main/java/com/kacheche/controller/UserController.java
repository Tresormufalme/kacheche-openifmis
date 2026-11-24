package com.kacheche.controller;

import com.kacheche.dto.ResetPasswordRequest;
import com.kacheche.dto.UserRequest;
import com.kacheche.dto.UserResponse;
import com.kacheche.entity.User;
import com.kacheche.service.UserCommand;
import com.kacheche.service.UserQuery;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController extends BaseController<
        User, UserRequest, UserResponse, UserQuery, UserCommand> {

    public UserController(UserQuery query, UserCommand command) {
        super(query, command);
    }

    // Permission requise : USER_RESET_PASSWORD (voir SecurityConfig)
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request) {

        command.resetPassword(id, request.newPassword());

        return ResponseEntity.noContent().build();
    }
}
