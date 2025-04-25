package com.example.archive.service;

import com.example.archive.config.ModbusProperties;
import com.example.archive.model.DeviceStatus;
import com.ghgande.j2mod.modbus.io.ModbusTCPTransaction;
import com.ghgande.j2mod.modbus.msg.ReadMultipleRegistersRequest;
import com.ghgande.j2mod.modbus.msg.ReadMultipleRegistersResponse;
import com.ghgande.j2mod.modbus.net.TCPMasterConnection;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;

@Service
public class DeviceStatusService {

    private final ModbusProperties props;

    public DeviceStatusService(ModbusProperties props) {
        this.props = props;
    }

    public List<DeviceStatus> getStatuses() {
        if (props.isUseFake()) {
            // String demo = "0x0A 0x90 0x00 0x00 0x00 0x09 0x01 0x03 0x20 "
            //             + "0x00 0x00 0x00 0x01 0x00 0x02 0x00 0x03 0x00 0x04 0x00 0x05 0x00 0x06 0x00 0x07 0x00 0x08 0x00 0x09 0x00 0x0A 0x00 0x0B 0x00 0x0C 0x00 0x0D 0x00 0x0E 0x00 0x0F ";
            String demo = "0x0A 0x90 0x00 0x00 0x00 0x09 0x01 0x03 0x08 "
            + "0x00 0x00 0x00 0x01 0x00 0x02 0x00 0x03 0x00 0x04 ";
            return parseStatus(demo);
        }

        List<DeviceStatus> all = new ArrayList<>();
        TCPMasterConnection conn = null;
        try {
            conn = new TCPMasterConnection(InetAddress.getByName(props.getIp()));
            conn.setPort(props.getPort());
            conn.connect();

            // 讀取室內機
            all.addAll(readBatch(conn,
                props.getUnitId(),
                "室內機",
                props.getIndoor().getStartOffset(),
                props.getIndoor().getCount()));

            // 讀取緊急對講機
            all.addAll(readBatch(conn,
                props.getUnitId(),
                "緊急對講機",
                props.getIntercom().getStartOffset(),
                props.getIntercom().getCount()));

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (conn != null && conn.isConnected()) {
                try { conn.close(); }
                catch (Exception ex) { ex.printStackTrace(); }
            }
        }
        return all;
    }

    /** 解析 demo hexString -> List<DeviceStatus> **/
    private List<DeviceStatus> parseStatus(String hexString) {
        String[] parts = hexString.trim().split("\\s+");
        if (parts.length < 9) return new ArrayList<>();

        byte[] bytes = new byte[parts.length];
        for (int i = 0; i < parts.length; i++) {
            bytes[i] = (byte) Integer.parseInt(parts[i].replace("0x", ""), 16);
        }

        int byteCount = bytes[8] & 0xFF;
        int deviceCount = byteCount / 2;
        int dataStart = 9;

        List<DeviceStatus> list = new ArrayList<>(deviceCount);
        for (int i = 0; i < deviceCount; i++) {
            int code = bytes[dataStart + 2*i + 1] & 0xFF;
            DeviceStatus ds = new DeviceStatus();
            ds.setDevice(i + 1);
            ds.setCode(code);
            ds.setMessage(getAlarmDescription(code));
            list.add(ds);
        }
        return list;
    }

    /** 真正通過 Modbus/TCP 讀取一批設備 **/
    private List<DeviceStatus> readBatch(TCPMasterConnection conn,
                                         int slaveId,
                                         String deviceType,
                                         int start,
                                         int count) throws Exception {
        ReadMultipleRegistersRequest req = new ReadMultipleRegistersRequest(start, count);
        req.setUnitID(slaveId);

        ModbusTCPTransaction trans = new ModbusTCPTransaction(conn);
        trans.setRequest(req);
        trans.execute();

        ReadMultipleRegistersResponse resp = (ReadMultipleRegistersResponse) trans.getResponse();
        List<DeviceStatus> list = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            int code = resp.getRegisterValue(i) & 0xFF;
            DeviceStatus ds = new DeviceStatus();
            ds.setDevice(i + 1);
            ds.setCode(code);
            ds.setMessage(deviceType + "-" + getAlarmDescription(code));
            list.add(ds);
        }
        return list;
    }

    /** 警報碼 mapping 中文描述 **/
    private String getAlarmDescription(int code) {
        return switch (code) {
            case 0  -> "無狀況";
            case 1  -> "求救";
            case 2  -> "瓦斯";
            case 3  -> "反脅迫";
            case 4  -> "火災";
            case 5  -> "防盜1區警報";
            case 6  -> "防盜2區警報";
            case 7  -> "防盜3區警報";
            case 8  -> "防盜4區警報";
            case 9  -> "防盜5區警報";
            case 10 -> "防拆警報";
            case 20 -> "警報解除通知";
            default -> "未知狀態: " + code;
            // default -> "正常/未知";
        };
    }
}
