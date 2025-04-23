// import React from 'react';

// function App() {
//     return (
//         <div>
//             <h1>Hello, Security App!</h1>
//         </div>
//     );
// }

// export default App;

import React, { useEffect, useState } from 'react';
import './App.css';

function Led({ message, active }) {
    return (
        <div className="led-container">
            <div className={`led ${active ? 'alarm' : 'normal'}`}></div>
            <span className="label">{message}</span>
        </div>
    );
}

function App() {
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/status')
            .then(res => res.json())
            .then(data => setStatuses(data));
    }, []);

    return (
        <div className="App">
            <h1>設備警報狀態</h1>
            <div className="grid">
                {statuses.map(s => (
                    <Led
                        key={s.device}
                        active={s.code !== 0}
                        message={`設備 ${s.device}: ${s.message}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;
