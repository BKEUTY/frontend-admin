import { useLanguage } from '@/store/LanguageContext';
import {
    FaBox,
    FaCheckCircle,
    FaClipboardCheck,
    FaClock,
    FaShippingFast,
    FaBan,
    FaCreditCard
} from 'react-icons/fa';
import './OrderProgress.css';

const OrderProgress = ({ currentStatus, shippingStatus, paymentMethod, paymentStatus, orderDate, estShippingDate }) => {
    const { t } = useLanguage();

    const isBank = paymentMethod?.toUpperCase() === 'BANK';
    const isPaid = paymentStatus?.toUpperCase() === 'PAID';

    const orderS = currentStatus?.toUpperCase();
    const shipS = shippingStatus?.toUpperCase();

    const steps = [
        { key: 'NOT_CONFIRMED', label: t('status_order_received'), date: orderDate },
        { key: 'CONFIRMED', label: t('order_status_CONFIRMED') },
        ...(isBank ? [{ key: 'AWAITING_PAY', label: t('status_awaiting_payment') }] : []),
        { key: 'SHIPPING', label: t('status_shipping') },
        { key: 'SUCCEEDED', label: t('order_status_SUCCEEDED'), date: (orderS === 'SUCCEEDED' ? estShippingDate : null) }
    ];

    const getStepIndex = () => {
        if (orderS === 'SUCCEEDED' || shipS === 'DELIVERED') return isBank ? 4 : 3;
        if (orderS === 'NOT_CONFIRMED') return 0;

        if (isBank) {
            if (orderS === 'CONFIRMED' && isPaid) return 3;
            if (orderS === 'CONFIRMED' && !isPaid) return 2;
        } else {
            if (orderS === 'CONFIRMED') return 2;
        }
        return 1;
    };

    const currentStepIndex = getStepIndex();
    const isCancelled = currentStatus?.toUpperCase() === 'CANCELLED' || shippingStatus?.toUpperCase() === 'CANCELLED';

    if (isCancelled) {
        return (
            <div className="order-progress-container is-cancelled">
                <div className="cancelled-message">
                    <FaBan /> <span>{t('order_status_CANCELLED')}</span>
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
                                <div className="step-dot"></div>
                                {index < steps.length - 1 && (
                                    <div className="step-line">
                                        <div className="line-fill"></div>
                                    </div>
                                )}
                            </div>
                            <div className="step-label">
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderProgress;
