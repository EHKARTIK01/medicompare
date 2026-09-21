package com.medicompare.controller;

import com.medicompare.dto.admin.DashboardStatsResponse;
import com.medicompare.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public DashboardStatsResponse stats() {
        return adminDashboardService.getStats();
    }
}
