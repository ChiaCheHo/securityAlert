package com.tsc.environmentcontrol.test.repo.impl;

import com.tsc.environmentcontrol.test.mapper.TestMapper;
import com.tsc.environmentcontrol.test.model.TestModel;
import com.tsc.environmentcontrol.test.repo.TestRepo;
import lombok.Data;

@Data
public class TestRepoImpl implements TestRepo {

    private final TestMapper testMapper;

    public TestRepoImpl(TestMapper testMapper) {
        this.testMapper = testMapper;
    }

    @Override
    public TestModel getById(Long id) {
        return testMapper.getById(id);
    }

    @Override
    public void create(TestModel testModel) {
        testMapper.create(testModel);
    }
}
