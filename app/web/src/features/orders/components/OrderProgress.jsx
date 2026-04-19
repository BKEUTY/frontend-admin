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

const OrderProgress = ({ currentStatus, shippingStatus, paymentMethod, paymentStatus }) => {
    const { t } = useLanguage();

    const isBank = paymentMethod?.toUpperCase() === 'BANK';
    const isPaid = paymentStatus?.toUpperCase() === 'PAID';

    const steps = [
        { key: 'RECEIVED', label: t('status_order_received') },
        { key: 'CONFIRMED', label: t('order_status_CONFIRMED') },
        ...(isBank ? [{ key: 'AWAITING_PAY', label: t('status_awaiting_payment') }] : []),
        { key: 'PACKING', label: t('shipping_status_NOT_CREATED') },
        { key: 'SHIPPING', label: t('status_shipping') },
        { key: 'SUCCEEDED', label: t('order_status_SUCCEEDED') }
    ];

    const getStepIndex = () => {
        const orderS = currentStatus?.toUpperCase();
        const shipS = shippingStatus?.toUpperCase();

        if (orderS === 'SUCCEEDED' || shipS === 'DELIVERED') return isBank ? 5 : 4;
        if (shipS === 'DELIVERING' || shipS === 'PICKED') return isBank ? 4 : 3;

        if (isBank) {
            if (shipS === 'CREATED' || (orderS === 'CONFIRMED' && isPaid)) return 3;
            if (orderS === 'CONFIRMED' && !isPaid) return 2;
            return orderS === 'CONFIRMED' ? 1 : 0;
        }

        if (shipS === 'CREATED' || orderS === 'CONFIRMED') return 2;
        return (orderS !== 'CANCELLED') ? 1 : 0;
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
                            <div className="step-label">{step.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderProgress;
