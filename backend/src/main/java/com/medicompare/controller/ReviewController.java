package com.medicompare.controller;

import com.medicompare.dto.review.ReviewRequest;
import com.medicompare.entity.Review;
import com.medicompare.security.UserPrincipal;
import com.medicompare.service.ReviewManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewManagementService reviewManagementService;

    @PostMapping
    public ResponseEntity<Review> add(@AuthenticationPrincipal UserPrincipal principal,
                                       @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewManagementService.addReview(principal.getId(), request));
    }

    @GetMapping("/hospital/{hospitalId}")
    public List<Review> forHospital(@PathVariable Long hospitalId) {
        return reviewManagementService.forHospital(hospitalId);
    }
}
