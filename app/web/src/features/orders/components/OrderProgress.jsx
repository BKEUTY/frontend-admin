import { useLanguage } from '@/store/LanguageContext';
import {
    FaBan,
    FaBox,
    FaCheckCircle,
    FaClipboardCheck,
    FaClock,
    FaShippingFast
} from 'react-icons/fa';
import './OrderProgress.css';

const OrderProgress = ({ currentStatus }) => {
    const { t } = useLanguage();

    const steps = [
        { key: 'UNPAID', label: t('status_unpaid'), icon: <FaClock /> },
        { key: 'PAID', label: t('status_paid'), icon: <FaClipboardCheck /> },
        { key: 'IN_PROGRESS', label: t('status_in_progress'), icon: <FaBox /> },
        { key: 'SHIPPING', label: t('order_status_shipping'), icon: <FaShippingFast /> },
        { key: 'COMPLETED', label: t('status_completed'), icon: <FaCheckCircle /> }
    ];

    const statusMap = {
        'UNPAID': 0,
        'PAID': 1,
        'IN_PROGRESS': 2,
        'SHIPPING': 3,
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
