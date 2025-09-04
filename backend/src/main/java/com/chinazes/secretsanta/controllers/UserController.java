package com.chinazes.secretsanta.controllers;

import com.chinazes.secretsanta.models.User;
import com.chinazes.secretsanta.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/api/users")
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentuser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(currentuser);
    }

    @GetMapping("/")
    public ResponseEntity<List<User>> AllUsers() {
        List<User> users = userService.allUsers();
        return ResponseEntity.ok(users);
    }
}
