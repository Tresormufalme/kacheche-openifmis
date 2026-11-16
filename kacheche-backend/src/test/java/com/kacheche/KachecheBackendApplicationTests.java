package com.kacheche;

import com.kacheche.dto.DashboardSummaryResponse;
import com.kacheche.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class KachecheBackendApplicationTests {

    @Autowired
    private DashboardService dashboardService;

    @Test
    void contextLoads() {
    }

    @Test
    void testDashboardSummary() {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
        assertNotNull(summary);
        assertTrue(summary.totalDepartments() >= 0);
        assertNotNull(summary.departmentExecutions());
        assertNotNull(summary.recentActivities());
    }

}
