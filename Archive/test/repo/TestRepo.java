package com.tsc.environmentcontrol.test.repo;

import com.tsc.environmentcontrol.test.model.TestModel;

public interface TestRepo {
    TestModel getById(Long id);
    void create(TestModel testModel);
}
