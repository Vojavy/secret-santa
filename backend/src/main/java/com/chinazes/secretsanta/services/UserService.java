package com.chinazes.secretsanta.services;

import com.chinazes.secretsanta.models.User;
import com.chinazes.secretsanta.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
    }

    public List<User> allUsers() {
        return new ArrayList<>(userRepository.findAll());
    }
}
