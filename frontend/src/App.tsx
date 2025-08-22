import React, { useEffect, useState } from 'react';


export default function App() {
    const [health, setHealth] = useState<string>('...');
    useEffect(() => {
        fetch('/api/healthz').then(r => r.json()).then(d => setHealth(d.status)).catch(() => setHealth('down'));
    }, []);
    return (
        <div style={{ fontFamily: 'system-ui', padding: 24 }}>
            <h1>HRMS Frontend</h1>
            <p>Backend health: {health}</p>
            <ul>
                <li><a href="/api/user/healthz">user-service health</a></li>
                <li><a href="/api/auth/healthz">auth-service health</a></li>
                <li><a href="/api/payroll/healthz">payroll-service health</a></li>
                <li><a href="/api/attendance/healthz">attendance-service health</a></li>
                <li><a href="/api/notification/healthz">notification-service health</a></li>
            </ul>
        </div>
    );
}