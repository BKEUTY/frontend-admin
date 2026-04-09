import React from 'react';
import { 
    FaClipboardCheck, 
    FaBox, 
    FaShippingFast, 
    FaCheckCircle, 
    FaClock,
    FaBan 
} from 'react-icons/fa';
import './OrderProgress.css';
import { useLanguage } from '../../i18n/LanguageContext';

const OrderProgress = ({ currentStatus }) => {
    const { t } = useLanguage();

    const steps = [
        { key: 'PENDING', label: t('order_status_pending'), icon: <FaClock /> },
        { key: 'CONFIRMED', label: t('order_status_confirmed'), icon: <FaClipboardCheck /> },
        { key: 'PACKING', label: t('order_status_packing'), icon: <FaBox /> },
        { key: 'SHIPPING', label: t('order_status_shipping'), icon: <FaShippingFast /> },
        { key: 'DELIVERED', label: t('order_status_delivered'), icon: <FaCheckCircle /> }
    ];

    const statusMap = {
        'PENDING': 0,
        'UNPAID': 0,
        'PAID': 1,
        'CONFIRMED': 1,
        'PACKING': 2,
        'IN_PROGRESS': 2,
        'SHIPPING': 3,
        'DELIVERED': 4,
        'COMPLETED': 4
    };

    const currentStepIndex = statusMap[currentStatus?.toUpperCase()] ?? -1;
    const isCancelled = currentStatus?.toUpperCase() === 'CANCELLED';

    if (isCancelled) {
        return (
            <div className="order-progress-container is-cancelled">
                <div className="cancelled-message">
                    <FaBan /> <span>{t('order_status_cancelled')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="order-progress-container">
            <div className="progress-track">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    
                    return (
                        <div key={step.key} className={`progress-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="step-pointer">
                                <div className="step-icon">
                                    {step.icon}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="step-line">
                                        <div className="line-fill"></div>
                                    </div>
                                )}
                            </div>
                            <div className="step-label">{step.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderProgress;
