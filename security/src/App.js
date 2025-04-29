import React, { useEffect, useState } from 'react';
import './App.css';

// 狀態對應圖檔檔名
const statusIconMap = {
    '無狀況': 'safe.png',
    '求救': 'sos.png',
    '瓦斯': 'gas-tank.png',
    '反脅迫': 'woman.png',
    '火災': 'fire.png',
    '防盜1區警報': 'theft.png',
    '防盜2區警報': 'theft.png',
    '防盜3區警報': 'theft.png',
    '防盜4區警報': 'theft.png',
    '防盜5區警報': 'theft.png',
    '防拆警報': 'shovel.png',
    '警報解除通知': 'safe.png' // 新增警報解除通知
};

/**
 * 解析 message 字段，去除設備類型前綴
 */
const parseStatusMessage = (message) => {
    return message.replace(/^(室內機|緊急對講機)-/, ''); // 移除「室內機-」或「緊急對講機-」
};

/**
 * 生成設備唯一鍵
 */
const getDeviceKey = (device, message) => {
    const type = message.startsWith('室內機') ? 'indoor' : 'intercom';
    return `${type}-${device}`;
};

/**
 * 固定顯示的 LED（圓角正方形），包含樓層選擇
 */
function Led({ message, floorAssignment, onFloorChange }) {
    const isOn = message.code !== 0;
    const status = parseStatusMessage(message.status); // 解析純警報描述
    const iconName = statusIconMap[status];
    const deviceKey = getDeviceKey(message.device, message.status);

    return (
        <div className={`led-pill ${isOn ? 'on' : 'off'}`}>
            {iconName && (
                <img
                    src={`${process.env.PUBLIC_URL}/${iconName}`}
                    alt={status}
                    className="pill-icon"
                />
            )}
            <span className="pill-text">
                {message.name} · {status}
            </span>
            <select
                className="pill-select"
                value={floorAssignment || 'floor1'}
                onChange={(e) => onFloorChange(deviceKey, e.target.value)}
            >
                <option value="floor1">F 1</option>
                <option value="floor2">F 2</option>
            </select>
        </div>
    );
}

/**
 * 可拖拽的 LED（地標 pin）
 */
function DraggableLed({ deviceKey, code, status, name, x, y, onUpdate }) {
    const [pos, setPos] = useState({ x, y });
    const [dragging, setDragging] = useState(false);
    const [rel, setRel] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);
    const isOn = code !== 0;
    const parsedStatus = parseStatusMessage(status); // 解析純警報描述
    const iconName = statusIconMap[parsedStatus];

    useEffect(() => {
        setPos({ x, y });
    }, [x, y]);

    const onMouseDown = (e) => {
        if (e.button !== 0) return;
        setDragging(true);
        setRel({ x: e.pageX - pos.x, y: e.pageY - pos.y });
        e.preventDefault();
    };
    const onMouseMove = (e) => {
        if (dragging) {
            setPos({ x: e.pageX - rel.x, y: e.pageY - rel.y });
            e.preventDefault();
        }
    };
    const onMouseUp = () => {
        if (dragging) {
            setDragging(false);
            onUpdate({ x: pos.x, y: pos.y });
        }
    };
    useEffect(() => {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging, pos, rel, onUpdate]);

    const editName = () => {
        const newName = prompt(`輸入設備 #${deviceKey} 名稱：`, name);
        if (newName !== null && newName.trim() !== '') {
            onUpdate({ name: newName.trim() });
        }
    };

    return (
        <div
            className="draggable-led"
            style={{ left: pos.x, top: pos.y, cursor: dragging ? 'grabbing' : 'grab' }}
            onMouseDown={onMouseDown}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <span className="name-label" onDoubleClick={editName}>{name}</span>
            <div className={`led-square ${isOn ? 'on' : 'off'}`}>
                {iconName && (
                    <img
                        src={`${process.env.PUBLIC_URL}/${iconName}`}
                        alt={parsedStatus}
                        className="status-icon"
                    />
                )}
            </div>
            {hovered && <span className="status-label">{parsedStatus}</span>}
        </div>
    );
}

/**
 * Tabs 組件
 */
function Tabs({ activeTab, setActiveTab }) {
    return (
        <div className="tabs">
            <button
                className={`tab ${activeTab === 'floor1' ? 'active' : ''}`}
                onClick={() => setActiveTab('floor1')}
            >
                F 1
            </button>
            <button
                className={`tab ${activeTab === 'floor2' ? 'active' : ''}`}
                onClick={() => setActiveTab('floor2')}
            >
                F 2
            </button>
        </div>
    );
}

function App() {
    const [statuses, setStatuses] = useState([]);
    const [layout, setLayout] = useState({
        floorAssignment: {},
        floor1: {},
        floor2: {}
    });
    const [activeTab, setActiveTab] = useState('floor1');

    // 每秒 fetch 狀態
    useEffect(() => {
        const fetchStatuses = () => {
            fetch('http://localhost:8080/api/status')
                .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
                .then(setStatuses)
                .catch(console.error);
        };
        fetchStatuses();
        const intervalId = setInterval(fetchStatuses, 1000);
        return () => clearInterval(intervalId);
    }, []);

    // 載入 localStorage
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('device-layout') || '{}');
            setLayout({
                floorAssignment: saved.floorAssignment || {},
                floor1: saved.floor1 || {},
                floor2: saved.floor2 || {}
            });
        } catch (e) {
            console.error(e);
        }
    }, []);

    // 新設備初始化
    useEffect(() => {
        if (!statuses.length) return;
        setLayout((prev) => {
            const updated = {
                ...prev,
                floorAssignment: { ...prev.floorAssignment },
                floor1: { ...prev.floor1 },
                floor2: { ...prev.floor2 }
            };
            statuses.forEach((ds, i) => {
                const id = getDeviceKey(ds.device, ds.message); // 使用唯一鍵
                if (!updated.floorAssignment[id]) {
                    updated.floorAssignment[id] = 'floor1';
                }
                const f = updated.floorAssignment[id];
                if (!updated[f][id]) {
                    updated[f][id] = {
                        x: 20 + (i % 7) * 120,
                        y: 20 + Math.floor(i / 7) * 140,
                        name: `${ds.message.startsWith('室內機') ? '室內機' : '緊急對講機'} ${ds.device}`
                    };
                }
            });
            localStorage.setItem('device-layout', JSON.stringify(updated));
            return updated;
        });
    }, [statuses]);

    const handleUpdate = (id, changes) => {
        setLayout((prev) => {
            const f = prev.floorAssignment[id] || 'floor1';
            const updated = {
                ...prev,
                [f]: {
                    ...prev[f],
                    [id]: { ...prev[f][id], ...changes }
                }
            };
            localStorage.setItem('device-layout', JSON.stringify(updated));
            return updated;
        });
    };

    const handleFloorChange = (deviceId, newFloor) => {
        setLayout((prev) => {
            const cur = prev.floorAssignment[deviceId] || 'floor1';
            const updated = {
                ...prev,
                floorAssignment: { ...prev.floorAssignment, [deviceId]: newFloor },
                [cur]: { ...prev[cur] },
                [newFloor]: { ...prev[newFloor] }
            };
            if (updated[cur][deviceId]) {
                updated[newFloor][deviceId] = updated[cur][deviceId];
                delete updated[cur][deviceId];
            }
            localStorage.setItem('device-layout', JSON.stringify(updated));
            return updated;
        });
    };

    const floorplanURL =
        activeTab === 'floor1'
            ? process.env.PUBLIC_URL + '/floorplan1.jpg'
            : process.env.PUBLIC_URL + '/floorplan2.png';

    return (
        <div className="App">
            {/* 標題 + 圖例 */}
            <div className="header-row">
                <h1>設備警報監控</h1>
                <div className="legend-row">
                    {/* 安全（無狀況） */}
                    <div className="legend-item">
                        <div className="legend-square off">
                            <img src={`${process.env.PUBLIC_URL}/safe.png`} alt="安全" className="status-icon" />
                        </div>
                        <span>安全</span>
                    </div>
                    {/* 求救 */}
                    <div className="legend-item">
                        <div className="legend-square on">
                            <img src={`${process.env.PUBLIC_URL}/sos.png`} alt="求救" className="status-icon" />
                        </div>
                        <span>求救</span>
                    </div>
                    {/* 瓦斯 */}
                    <div className="legend-item">
                        <div className="legend-square on">
                            <img src={`${process.env.PUBLIC_URL}/gas-tank.png`} alt="瓦斯" className="status-icon" />
                        </div>
                        <span>瓦斯</span>
                    </div>
                    {/* 反脅迫 */}
                    <div className="legend-item">
                        <div className="legend-square on">
                            <img src={`${process.env.PUBLIC_URL}/woman.png`} alt="反脅迫" className="status-icon" />
                        </div>
                        <span>反脅迫</span>
                    </div>
                    {/* 火災 */}
                    <div className="legend-item">
                        <div className="legend-square on">
                            <img src={`${process.env.PUBLIC_URL}/fire.png`} alt="火災" className="status-icon" />
                        </div>
                        <span>火災</span>
                    </div>
                    {/* 防盜 */}
                    <div className="legend-item">
                        <div className="legend-square on">
                            <img src={`${process.env.PUBLIC_URL}/theft.png`} alt="防盜" className="status-icon" />
                        </div>
                        <span>防盜</span>
                    </div>
                    {/* 防拆警報 */}
                    <div className="legend-item">
                        <div className="legend-square on">
                            <img src={`${process.env.PUBLIC_URL}/shovel.png`} alt="防拆警報" className="status-icon" />
                        </div>
                        <span>防拆</span>
                    </div>
                    {/* 警報解除通知 */}
                    <div className="legend-item">
                        <div className="legend-square off">
                            <img src={`${process.env.PUBLIC_URL}/safe.png`} alt="解除" className="status-icon" />
                        </div>
                        <span>解除</span>
                    </div>
                </div>
            </div>

            {/* 主容器 */}
            <div className="main-container">
                <div className="sidebar">
                    <div className="led-grid">
                        {statuses.map((ds) => {
                            const deviceKey = getDeviceKey(ds.device, ds.message);
                            return (
                                <Led
                                    key={deviceKey}
                                    message={{
                                        name:
                                            layout[layout.floorAssignment[deviceKey] || 'floor1'][deviceKey]?.name ||
                                            `${ds.message.startsWith('室內機') ? '室內機' : '緊急對講機'} ${ds.device}`,
                                        status: ds.message,
                                        code: ds.code,
                                        device: ds.device
                                    }}
                                    floorAssignment={layout.floorAssignment[deviceKey]}
                                    onFloorChange={handleFloorChange}
                                />
                            );
                        })}
                    </div>
                </div>
                <div
                    className="draggable-area"
                    style={{ backgroundImage: `url(${floorplanURL})` }}
                >
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="draggable-content">
                        {statuses
                            .filter((ds) => layout.floorAssignment[getDeviceKey(ds.device, ds.message)] === activeTab)
                            .map((ds) => {
                                const deviceKey = getDeviceKey(ds.device, ds.message);
                                const info = layout[activeTab][deviceKey] || {};
                                return (
                                    <DraggableLed
                                        key={deviceKey}
                                        deviceKey={deviceKey}
                                        code={ds.code}
                                        status={ds.message}
                                        name={info.name || `${ds.message.startsWith('室內機') ? '室內機' : '緊急對講機'} ${ds.device}`}
                                        x={info.x || 20}
                                        y={info.y || 20}
                                        onUpdate={(changes) => handleUpdate(deviceKey, changes)}
                                    />
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;