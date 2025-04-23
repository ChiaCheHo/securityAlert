package com.example.archive.service;

import com.example.archive.model.DeviceStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DeviceStatusService {

    /**
     * 解析完整的 Modbus TCP 回包（包含 9 bytes header + 2*N bytes data），
     * 並回傳 N 筆 DeviceStatus。
     */
    public List<DeviceStatus> parseStatus(String hexString) {
        String[] parts = hexString.trim().split("\\s+");
        byte[] bytes = new byte[parts.length];
        for (int i = 0; i < parts.length; i++) {
            bytes[i] = (byte) Integer.parseInt(parts[i].replace("0x", ""), 16);
        }

        // Modbus TCP header: MBAP (7 bytes) + Function(1) + ByteCount(1) = 9 bytes
        int headerLen = 9;
        int dataLen = bytes.length - headerLen;
        int deviceCount = dataLen / 2;

        List<DeviceStatus> list = new ArrayList<>(deviceCount);
        for (int i = 0; i < deviceCount; i++) {
            int offset = headerLen + 2 * i;
            int code = bytes[offset + 1] & 0xFF;  // 低位是真正的 code
            String msg;
            switch (code) {
                case 1:  msg = "求救"; break;
                case 2:  msg = "瓦斯"; break;
                case 3:  msg = "反脅迫"; break;
                case 4:  msg = "火災"; break;
                case 5:  msg = "防盜1區警報"; break;
                case 6:  msg = "防盜2區警報"; break;
                case 7:  msg = "防盜3區警報"; break;
                case 8:  msg = "防盜4區警報"; break;
                case 9:  msg = "防盜5區警報"; break;
                case 10: msg = "防拆警報"; break;
                case 0:  msg = "警報被解除通知"; break;
                default: msg = "正常"; break;
            }
            DeviceStatus ds = new DeviceStatus();
            ds.setDevice(i + 1);
            ds.setCode(code);
            ds.setMessage(msg);
            list.add(ds);
        }
        return list;
    }
}
