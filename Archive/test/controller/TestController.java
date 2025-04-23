package com.tsc.environmentcontrol.test.controller;

import com.tsc.environmentcontrol.test.controller.vo.TestVO;
import com.tsc.environmentcontrol.test.model.TestModel;
import com.tsc.environmentcontrol.test.repo.TestRepo;
import com.tsc.environmentcontrol.test.service.TestService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {
    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @GetMapping("/test/{id}")
    public TestModel get(@PathVariable Long id) {
        return testService.getById(id);
    }

    @PostMapping("/test")
    public void create(@RequestBody TestVO testVO) {
        testService.create();
    }
}
