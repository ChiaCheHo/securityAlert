package com.example.archive.server;

import com.example.archive.config.ModbusProperties;
import com.ghgande.j2mod.modbus.net.ModbusTCPListener;
import com.ghgande.j2mod.modbus.procimg.SimpleProcessImage;
import com.ghgande.j2mod.modbus.procimg.SimpleRegister;
import com.ghgande.j2mod.modbus.slave.ModbusSlave;
import com.ghgande.j2mod.modbus.slave.ModbusSlaveFactory;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

/**
 * 完整示例：一次性铺满寄存器到最大 offset，再覆盖“室内机”与“对讲机”各自的数据
 */
@Component
public class ModbusTCPServer {

    private ModbusTCPListener listener;
    private ModbusSlave       slave;

    private final ModbusProperties props;

    public ModbusTCPServer(ModbusProperties props) {
        this.props = props;
    }

    @PostConstruct
    public void startServer() throws Exception {
        int unitId       = props.getUnitId();
        int indoorOffset = props.getIndoor().getStartOffset();
        int indoorCount  = props.getIndoor().getCount();
        int interOffset  = props.getIntercom().getStartOffset();
        int interCount   = props.getIntercom().getCount();

        // 1) 计算我们需要的最大地址（exclusive）
        int maxOffset = Math.max(indoorOffset + indoorCount, interOffset + interCount);

        // 2) 新建 ProcessImage，并一次性填充 0 到 maxOffset-1
        SimpleProcessImage spi = new SimpleProcessImage();
        for (int i = 0; i < maxOffset; i++) {
            spi.addRegister(new SimpleRegister(0));
        }

        // 3) 覆盖写入“室内机”那段寄存器
        //    这里用示例值 1..indoorCount，你可以改成 demo 数组
        for (int i = 0; i < indoorCount; i++) {
            spi.getRegister(i + indoorOffset).setValue(i);
        }

        // 4) 覆盖写入“紧急对讲机”那段寄存器
        //    这里用示例值 11..(11+interCount-1)
        for (int i = 0; i < interCount; i++) {
            spi.getRegister(i + interOffset).setValue(10 + i);
        }

        // 5) 创建并启动 Modbus TCP Slave
        slave = ModbusSlaveFactory.createTCPSlave(props.getPort(), unitId);
        slave.addProcessImage(unitId, spi);

        // 6) 监听器（slave.open() 内部已经启动了 TCP 接收）
        listener = new ModbusTCPListener(3);
        listener.setPort(props.getPort());
        slave.open();

        System.out.println("▶ Modbus TCP Server listening on "
            + props.getIp() + ":" + props.getPort()
            + " (unitId=" + unitId + ")");
    }

    @PreDestroy
    public void stopServer() {
        try {
            if (listener != null) listener.stop();
            if (slave    != null) slave.close();
            System.out.println("Modbus TCP Server stopped");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
