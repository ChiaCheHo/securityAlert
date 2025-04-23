package com.tsc.environmentcontrol.test.service.impl;

import com.tsc.environmentcontrol.test.model.TestModel;
import com.tsc.environmentcontrol.test.repo.TestRepo;
import com.tsc.environmentcontrol.test.service.TestService;
import com.tsc.environmentcontrol.test.service.dto.CreateTestDTO;
import lombok.Data;

@Data
public class TestServiceImpl implements TestService {
    private final TestRepo testRepo;
    public TestServiceImpl(TestRepo testRepo) {
        this.testRepo = testRepo;
    }

    @Override
    public void create(CreateTestDTO createTestDTO) {
        TestModel testModel = new TestModel();
        testModel.setName(createTestDTO.getName());
        testModel.setEmail(createTestDTO.getEmail());

        testRepo.create(testModel);
    }

    @Override
    public TestModel getById(Long id) {
        return testRepo.getById(id);
    }
}
