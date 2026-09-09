package com.project.backend.controller;

import com.project.backend.dto.LoginRequestDTO;
import com.project.backend.dto.LoginResponseDTO;
import com.project.backend.dto.RegisterFournisseurDTO;
import com.project.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto){
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("register-fournisseur")
    public ResponseEntity<Void> registerFournisseur(@Valid @RequestBody RegisterFournisseurDTO dto){
        authService.registerFournisseur(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
