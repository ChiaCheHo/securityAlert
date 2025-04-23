import React, { useEffect, useState } from 'react';
import './App.css';

function Led({ code, message }) {
    const isOn = code !== 0;
    return (
        <div className="led-container">
            <div className={`led ${isOn ? 'on' : 'off'}`}></div>
            <div className="label">{message}</div>
        </div>
    );
}

function App() {
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/status')
            .then(res => {
                if (!res.ok) throw new Error(res.statusText);
                return res.json();
            })
            .then(data => setStatuses(data))
            .catch(err => console.error('Fetch error:', err));
    }, []);

    return (
        <div className="App">
            <h1>設備警報監控</h1>
            <div className="led-grid">
                {statuses.map(ds => (
                    <Led
                        key={ds.device}
                        code={ds.code}
                        message={`#${ds.device}: ${ds.message}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;
