import React, { Component } from 'react';
import { notifyError } from '@/services/NotificationService';
import { getTranslation } from '@/utils/translate';

import { Result, Button, Typography } from 'antd';
const { Paragraph, Text } = Typography;

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
        // notifyError is available if needed, but let's focus on UI
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
                    <div className="admin-glass-card max-w-2xl w-full p-8 text-center">
                        <Result
                            status="error"
                            title={<span className="text-2xl font-bold">Oops! Something went wrong</span>}
                            subTitle={getTranslation('api_error_general')}
                            extra={[
                                <Button 
                                    type="primary" 
                                    key="refresh" 
                                    size="large"
                                    onClick={() => window.location.reload()}
                                    className="bg-primary hover:bg-primary-hover border-none h-12 px-8 rounded-xl font-semibold"
                                >
                                    {getTranslation('refresh')}
                                </Button>,
                                <Button 
                                    key="home" 
                                    size="large"
                                    onClick={() => window.location.href = '/admin'}
                                    className="h-12 px-8 rounded-xl font-semibold"
                                >
                                    Go to Dashboard
                                </Button>
                            ]}
                        >
                            {import.meta.env.DEV && (
                                <div className="mt-6 text-left">
                                    <Paragraph>
                                        <Text strong className="text-red-500">Error Details:</Text>
                                    </Paragraph>
                                    <pre className="bg-red-50 p-4 rounded-xl border border-red-100 overflow-auto max-h-48 text-xs text-red-700">
                                        {this.state.error?.stack || this.state.error?.toString()}
                                    </pre>
                                </div>
                            )}
                        </Result>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}


export default ErrorBoundary;

