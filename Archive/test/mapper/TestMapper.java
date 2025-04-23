package com.tsc.environmentcontrol.test.mapper;

import com.tsc.environmentcontrol.test.model.TestModel;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TestMapper {
    TestModel getById(Long id);
    void create(TestModel testModel);
}
