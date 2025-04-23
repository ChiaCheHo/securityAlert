package com.example.archive.controller;

import com.example.archive.model.DeviceStatus;
import com.example.archive.service.DeviceStatusService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = "http://localhost:3000") // 允许前端跨域请求
public class DeviceStatusController {

    private final DeviceStatusService service;

    public DeviceStatusController(DeviceStatusService service) {
        this.service = service;
    }

    /**
     * 演示接口：直接使用示例说明2的回包字符串
     */
    @GetMapping
    public List<DeviceStatus> getStatuses() {
        String demo = "0x00 0x00 0x00 0x06 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 "
                + "0x00 0x00 0x00 0x04 0x00 0x00 0x00 0x00 0x00 0x08 0x00 0x00 "
                + "0x00 0x00 0x00 0x00";
        return service.parseStatus(demo);
    }
}
