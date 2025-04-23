package com.example.archive.controller;

import com.example.archive.model.DeviceStatus;
import com.example.archive.service.DeviceStatusService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = "http://localhost:3000")
public class DeviceStatusController {

    private final DeviceStatusService service;

    public DeviceStatusController(DeviceStatusService service) {
        this.service = service;
    }

    /**
     * Demo 接口：使用示例 40003~40005 全 0 的回包
     * 「0x0A 0x90 0x0 0x0 0x0 0x09 0x01 0x03 0x06 0x00 0x00 0x00 0x00 0x00 0x00」
     */
    @GetMapping
    public List<DeviceStatus> getStatuses() {
        String demo = "0x0A 0x90 0x00 0x00 0x00 0x09 0x01 0x03 0x06 "
                + "0x00 0x01 0x00 0x02 0x00 0x03";
        return service.parseStatus(demo);
    }
}
