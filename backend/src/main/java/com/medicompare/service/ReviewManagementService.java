package com.medicompare.service;

import com.medicompare.dto.review.ReviewRequest;
import com.medicompare.entity.Hospital;
import com.medicompare.entity.Review;
import com.medicompare.entity.User;
import com.medicompare.exception.ResourceNotFoundException;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.repository.ReviewRepository;
import com.medicompare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewManagementService {

    private final ReviewRepository reviewRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    @Transactional
    public Review addReview(Long userId, ReviewRequest request) {
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Review review = Review.builder()
                .hospital(hospital)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(true)
                .build();
        review = reviewRepository.save(review);

        recalculateHospitalRating(hospital);
        return review;
    }

    public List<Review> forHospital(Long hospitalId) {
        return reviewRepository.findByHospitalIdAndApprovedTrueOrderByCreatedAtDesc(hospitalId);
    }

    public List<Review> allForAdmin() {
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void setApproval(Long reviewId, boolean approved) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setApproved(approved);
        reviewRepository.save(review);
        recalculateHospitalRating(review.getHospital());
    }

    @Transactional
    public void delete(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        Hospital hospital = review.getHospital();
        reviewRepository.delete(review);
        recalculateHospitalRating(hospital);
    }

    private void recalculateHospitalRating(Hospital hospital) {
        List<Review> approved = reviewRepository.findByHospitalIdAndApprovedTrueOrderByCreatedAtDesc(hospital.getId());
        double avg = approved.stream().mapToInt(Review::getRating).average().orElse(0.0);
        hospital.setRating(Math.round(avg * 10.0) / 10.0);
        hospital.setReviewCount(approved.size());
        hospitalRepository.save(hospital);
    }
}
