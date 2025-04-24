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

    @GetMapping
    public List<DeviceStatus> getStatuses() {
        // 自動根據 useFake 開關返回假數據或真實數據
        return service.getStatuses();
    }
}
