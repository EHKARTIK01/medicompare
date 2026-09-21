package com.medicompare.repository;

import com.medicompare.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByHospitalIdAndApprovedTrueOrderByCreatedAtDesc(Long hospitalId);
    List<Review> findAllByOrderByCreatedAtDesc();
}
