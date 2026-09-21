package com.medicompare.controller;

import com.medicompare.dto.auth.ChangePasswordRequest;
import com.medicompare.dto.auth.UpdateProfileRequest;
import com.medicompare.dto.auth.UserProfileResponse;
import com.medicompare.security.UserPrincipal;
import com.medicompare.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public UserProfileResponse getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return userProfileService.getProfile(principal.getId());
    }

    @PutMapping
    public UserProfileResponse updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                              @Valid @RequestBody UpdateProfileRequest request) {
        return userProfileService.updateProfile(principal.getId(), request);
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody ChangePasswordRequest request) {
        userProfileService.changePassword(principal.getId(), request);
        return ResponseEntity.ok().build();
    }
}
