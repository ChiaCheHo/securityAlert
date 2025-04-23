package com.example.archive.model;

/**
 * 單個設備狀態
 */
public class DeviceStatus {
    private int device;
    private int code;
    private String message;

    public int getDevice() {
        return device;
    }
    public void setDevice(int device) {
        this.device = device;
    }
    public int getCode() {
        return code;
    }
    public void setCode(int code) {
        this.code = code;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
