import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * 固定顯示的 LED（圓角正方形）
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

    // 同步外部 x,y 變化
    useEffect(() => {
        setPos({ x, y });
    }, [x, y]);

    // 拖曳開始
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

    // 拖拽結束，保存位置
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

    const isOn = code !== 0;

    // 編輯設備名稱
    const editName = () => {
        const newName = prompt(`輸入設備 #${device} 名稱：`, name);
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

    // 1. 每秒從後端 fetch 最新狀態
    useEffect(() => {
        const fetchStatuses = () => {
            fetch('http://localhost:8080/api/status')
                .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
                .then(setStatuses)
                .catch(console.error);
        };

        // 立即執行一次，然後每秒執行
        fetchStatuses();
        const intervalId = setInterval(fetchStatuses, 1000);

        return () => clearInterval(intervalId);
    }, []);

    // 2. 初始化並且合併 localStorage 保存的布局
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('device-layout') || '{}');
        setLayout(saved);
    }, []);

    // 3. 如果有新的設備，賦予默認位置和名稱
    useEffect(() => {
        if (!statuses.length) return;
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

    // 統一存儲更新函數
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

    const floorplanURL = process.env.PUBLIC_URL + '/floorplan.jpeg';

    return (
        <div className="App">
            <h1>設備警報監控</h1>
            <div className="main-container">
                {/* 左邊 Sidebar：固定顯示 */}
                <div className="sidebar">
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
                </div>
                {/* 右邊：拖曳 + 平面圖 */}
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
        </div>
    );
}

export default App;