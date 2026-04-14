import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ items }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className='admin-floating-dock'>
            {items.map(item => (
                <button
                    key={item.key}
                    type="button"
                    className={`dock-item ${location.pathname === item.key || location.pathname.startsWith(item.key + '/') ? 'active' : ''}`}
                    onClick={() => navigate(item.key)}
                >
                    {item.icon}
                    <span className='dock-tooltip'>{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default AdminSidebar;
