import React, { Component } from 'react';
import { notifyError } from '../../utils/NotificationService';
import { getTranslation } from '../../i18n/translate';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        // Just show the notification as requested
        notifyError('error', 'error_unknown');
    }

    render() {
        if (this.state.hasError) {
            // Return a subtle placeholder so it doesn't break the whole layout but shows something is wrong
            return (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 'bold' }}>
                        {getTranslation('api_error_general') || 'Error loading content'}
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <div style={{ marginTop: '15px', padding: '10px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: '4px', display: 'inline-block', textAlign: 'left' }}>
                            <code style={{ fontSize: '12px', color: '#cf1322' }}>
                                {this.state.error?.toString()}
                            </code>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
