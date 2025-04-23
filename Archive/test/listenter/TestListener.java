package com.tsc.environmentcontrol.test.listenter;

import org.springframework.amqp.rabbit.annotation.RabbitListener;

import java.util.Map;

import static com.tsc.environmentcontrol.infra.RabbitConfig.RETURN_DOOR_QUEUE;

public class TestListener {
    @RabbitListener(queues = "test_queue")
    public void testQueue(Map<String, Object> data)
        // 接收queue資料
    }
}
