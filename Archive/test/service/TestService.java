package com.tsc.environmentcontrol.test.service;

import com.tsc.environmentcontrol.test.model.TestModel;
import com.tsc.environmentcontrol.test.service.dto.CreateTestDTO;

public interface TestService {
    void create(CreateTestDTO createTestDTO);
    TestModel getById(Long id);
}
