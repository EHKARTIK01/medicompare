package com.medicompare.controller;

import com.medicompare.entity.Review;
import com.medicompare.service.ReviewManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewManagementService reviewManagementService;

    @GetMapping
    public List<Review> all() {
        return reviewManagementService.allForAdmin();
    }

    @PutMapping("/{id}/approval")
    public ResponseEntity<Void> setApproval(@PathVariable Long id, @RequestParam boolean approved) {
        reviewManagementService.setApproval(id, approved);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviewManagementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
