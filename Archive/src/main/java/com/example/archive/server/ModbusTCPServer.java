package com.example.archive.server;

import com.example.archive.config.ModbusProperties;
import com.ghgande.j2mod.modbus.procimg.SimpleProcessImage;
import com.ghgande.j2mod.modbus.procimg.SimpleRegister;
import com.ghgande.j2mod.modbus.slave.ModbusSlave;
import com.ghgande.j2mod.modbus.slave.ModbusSlaveFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.net.InetAddress;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class ModbusTCPServer {

    private static final Logger logger = LoggerFactory.getLogger(ModbusTCPServer.class);
    private final ModbusProperties props;
    private ModbusSlave slave;
    private SimpleProcessImage spi;
    private final AtomicBoolean running = new AtomicBoolean(false);

    public ModbusTCPServer(ModbusProperties props) {
        this.props = props;
    }

    @PostConstruct
    public void start() {
        if (!props.isUseFake()) {
            logger.info("Modbus TCP 服務器未啟動 (useFake=false)");
            return;
        }

        logger.info("正在啟動 Modbus TCP 服務器，端口：{}", props.getPort());
        try {
            // 初始化 Modbus Slave，綁定到 0.0.0.0（所有網絡接口）
            slave = ModbusSlaveFactory.createTCPSlave(
                InetAddress.getByName("0.0.0.0"),
                props.getPort(),
                10, // 連接池大小
                false // 非阻塞模式
            );

            // 創建 Process Image
            spi = new SimpleProcessImage();

            // 模擬室內機 (40001~41000, 偏移 0~999)
            int indoorCount = props.getIndoor().getCount();
            logger.info("分配室內機寄存器：偏移={}，數量={}", props.getIndoor().getStartOffset(), indoorCount);
            for (int i = 0; i < indoorCount; i++) {
                spi.addRegister(props.getIndoor().getStartOffset() + i, new SimpleRegister(generateRandomAlarmCode()));
            }

            // 模擬緊急對講機 (42001~43000, 偏移 2000~2999)
            int intercomCount = props.getIntercom().getCount();
            logger.info("分配緊急對講機寄存器：偏移={}，數量={}", props.getIntercom().getStartOffset(), intercomCount);
            for (int i = 0; i < intercomCount; i++) {
                spi.addRegister(props.getIntercom().getStartOffset() + i, new SimpleRegister(generateRandomAlarmCode()));
            }

            // 將 Process Image 與 Unit ID 關聯
            slave.addProcessImage(props.getUnitId(), spi);

            // 啟動 Slave
            slave.open();
            running.set(true);
            logger.info("Modbus TCP 服務器啟動成功");

            // 啟動動態數據模擬（可選）
            new Thread(this::simulateDynamicData).start();

        } catch (Exception e) {
            logger.error("無法啟動 Modbus TCP 服務器", e);
        }
    }

    @PreDestroy
    public void stop() {
        if (slave != null && running.get()) {
            try {
                slave.close();
                running.set(false);
                logger.info("Modbus TCP 服務器已停止");
            } catch (Exception e) {
                logger.error("無法停止 Modbus TCP 服務器", e);
            }
        }
    }

    /**
     * 模擬動態警報狀態更新（用於測試）
     */
    private void simulateDynamicData() {
        Random random = new Random();
        while (running.get()) {
            try {
                Thread.sleep(10000); // 每 10 秒更新一次
                if (spi != null) {
                    // 隨機更新室內機寄存器
                    int indoorCount = props.getIndoor().getCount();
                    for (int i = 0; i < Math.min(indoorCount, 5); i++) {
                        int regIndex = props.getIndoor().getStartOffset() + random.nextInt(indoorCount);
                        spi.setRegister(regIndex, new SimpleRegister(generateRandomAlarmCode()));
                        logger.debug("更新室內機寄存器：索引={}", regIndex);
                    }
                    // 隨機更新緊急對講機寄存器
                    int intercomCount = props.getIntercom().getCount();
                    for (int i = 0; i < Math.min(intercomCount, 5); i++) {
                        int regIndex = props.getIntercom().getStartOffset() + random.nextInt(intercomCount);
                        spi.setRegister(regIndex, new SimpleRegister(generateRandomAlarmCode()));
                        logger.debug("更新緊急對講機寄存器：索引={}", regIndex);
                    }
                    logger.debug("已更新隨機警報碼");
                }
            } catch (Exception e) {
                logger.error("動態數據模擬錯誤", e);
            }
        }
    }

    /**
     * 生成隨機警報碼（模擬真實設備警報狀態）
     */
    private int generateRandomAlarmCode() {
        Random random = new Random();
        int[] alarmCodes = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20}; // 協議中的 Low Byte 值
        return alarmCodes[random.nextInt(alarmCodes.length)];
    }
}