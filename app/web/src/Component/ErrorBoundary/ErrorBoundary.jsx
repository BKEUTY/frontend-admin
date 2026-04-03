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
        notifyError('error', 'error_unknown');
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fffbfb', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '600px', width: '100%', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#e11d48', fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>
                            {getTranslation('api_error_general')}
                        </p>
                        
                        {import.meta.env.DEV && (
                            <div style={{ marginTop: '20px', padding: '15px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', textAlign: 'left', overflowX: 'auto' }}>
                                <code style={{ fontSize: '13px', color: '#9f1239', fontFamily: 'monospace' }}>
                                    {this.state.error?.toString()}
                                </code>
                            </div>
                        )}
                        
                        <button 
                            onClick={() => window.location.reload()}
                            style={{ marginTop: '24px', padding: '10px 24px', background: 'var(--color_main_title)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            {getTranslation('refresh')}
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

