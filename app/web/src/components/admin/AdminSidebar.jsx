import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ items }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className='admin-floating-dock'>
            {items.map(item => (
                <div
                    key={item.key}
                    className={`dock-item ${location.pathname === item.key ? 'active' : ''}`}
                    onClick={() => navigate(item.key)}
                >
                    {item.icon}
                    <span className='dock-tooltip'>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default AdminSidebar;
