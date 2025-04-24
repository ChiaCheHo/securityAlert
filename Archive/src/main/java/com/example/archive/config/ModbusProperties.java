package com.example.archive.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "modbus")
public class ModbusProperties {
    private String ip;
    private int port;
    private int unitId;
    private boolean useFake;

    private Batch indoor = new Batch();
    private Batch intercom = new Batch();

    public static class Batch {
        private int startOffset;
        private int count;
        public int getStartOffset() { return startOffset; }
        public void setStartOffset(int startOffset) { this.startOffset = startOffset; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }
    public int getPort() { return port; }
    public void setPort(int port) { this.port = port; }
    public int getUnitId() { return unitId; }
    public void setUnitId(int unitId) { this.unitId = unitId; }
    public boolean isUseFake() { return useFake; }
    public void setUseFake(boolean useFake) { this.useFake = useFake; }
    public Batch getIndoor() { return indoor; }
    public Batch getIntercom() { return intercom; }
}
