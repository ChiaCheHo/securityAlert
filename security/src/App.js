import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * 固定显示的 LED（圆角正方形）
 */
function Led({ message }) {
    const isOn = message.code !== 0;
    return (
        <div className="led-box">
            <span className="name-label">{message.name}</span>
            <div className={`led-square ${isOn ? 'on' : 'off'}`}></div>
            <span className="status-label">{message.status}</span>
        </div>
    );
}

/**
 * 可拖拽的 LED
 */
function DraggableLed({ device, code, status, name, x, y, onUpdate }) {
    const [pos, setPos] = useState({ x, y });
    const [dragging, setDragging] = useState(false);
    const [rel, setRel] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);

    // 拖拽开始
    const onMouseDown = e => {
        if (e.button !== 0) return;
        setDragging(true);
        setRel({ x: e.pageX - pos.x, y: e.pageY - pos.y });
        e.preventDefault();
    };

    // 拖拽中
    const onMouseMove = e => {
        if (dragging) {
            setPos({ x: e.pageX - rel.x, y: e.pageY - rel.y });
            e.preventDefault();
        }
    };

    // 拖拽结束，保存位置
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
    });

    const isOn = code !== 0;

    // 编辑设备名称
    const editName = () => {
        const newName = prompt(`为设备 #${device} 输入名称：`, name);
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
            <div className={`led-square ${isOn ? 'on' : 'off'}`}></div>
            {hovered && <span className="status-label">{status}</span>}
        </div>
    );
}

function App() {
    const [statuses, setStatuses] = useState([]);
    const [layout, setLayout] = useState({});

    // 1. 从后端拉取状态
    useEffect(() => {
        fetch('http://localhost:8080/api/status')
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then(setStatuses)
            .catch(console.error);
    }, []);

    // 2. 初始化并合并 localStorage 保存的布局
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('device-layout') || '{}');
        setLayout(saved);
    }, []);

    // 3. 如果有新的设备，赋予默认位置和名称
    useEffect(() => {
        if (statuses.length === 0) return;
        setLayout(prev => {
            const updated = { ...prev };
            statuses.forEach((ds, i) => {
                const id = ds.device;
                if (!updated[id]) {
                    updated[id] = {
                        x: 20 + (i % 7) * 120,
                        y: 20 + Math.floor(i / 7) * 140,
                        name: `Device ${id}`
                    };
                }
            });
            localStorage.setItem('device-layout', JSON.stringify(updated));
            return updated;
        });
    }, [statuses]);

    // 统一存储更新函数
    const handleUpdate = (id, changes) => {
        setLayout(prev => {
            const updated = {
                ...prev,
                [id]: { ...prev[id], ...changes }
            };
            localStorage.setItem('device-layout', JSON.stringify(updated));
            return updated;
        });
    };

    const floorplanURL = process.env.PUBLIC_URL + '/floorplan.jpg';

    return (
        <div className="App">
            <h1>設備警報監控</h1>

            {/* 第一区： 固定显示 */}
            <div className="led-grid">
                {statuses.map(ds => (
                    <Led
                        key={ds.device}
                        message={{
                            name: layout[ds.device]?.name,
                            status: ds.message,
                            code: ds.code
                        }}
                    />
                ))}
            </div>

            {/* 第二区： 拖拽 + 平面图 */}
            <div
                className="draggable-area"
                style={{
                    backgroundImage: `url(${floorplanURL})`
                }}
            >
                {statuses.map(ds => {
                    const info = layout[ds.device] || {};
                    return (
                        <DraggableLed
                            key={ds.device}
                            device={ds.device}
                            code={ds.code}
                            status={ds.message}
                            name={info.name}
                            x={info.x}
                            y={info.y}
                            onUpdate={changes => handleUpdate(ds.device, changes)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default App;
