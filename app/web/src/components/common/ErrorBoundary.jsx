import React, { Component } from 'react';
import { Result, Button, Typography } from 'antd';
import { useLanguage } from '@/store/LanguageContext';
const { Paragraph, Text } = Typography;

class ErrorBoundaryInternal extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, isChunkError: false };
    }

    static getDerivedStateFromError(error) {
        const isChunkError = /Failed to fetch dynamically imported module|Loading chunk|Loading CSS chunk/.test(error.message);
        return { hasError: true, error, isChunkError };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const { isChunkError } = this.state;
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
                    <div className="admin-glass-card max-w-2xl w-full p-8 text-center">
                        <Result
                            status={isChunkError ? "info" : "error"}
                            title={<span className="text-2xl font-bold">{isChunkError ? this.props.t('error_chunk_title') : this.props.t('error_500_title')}</span>}
                            subTitle={isChunkError 
                                ? this.props.t('error_chunk_desc') 
                                : this.props.t('error_500_desc')
                            }
                            extra={[
                                <Button 
                                    type="primary" 
                                    key="refresh" 
                                    size="large"
                                    onClick={() => window.location.reload()}
                                    className="bg-primary hover:bg-primary-hover border-none h-12 px-8 rounded-xl font-semibold"
                                >
                                    {isChunkError ? this.props.t('error_chunk_btn') : this.props.t('error_reload_btn')}
                                </Button>,
                                !isChunkError && (
                                    <Button 
                                        key="home" 
                                        size="large"
                                        onClick={() => window.location.href = '/admin'}
                                        className="h-12 px-8 rounded-xl font-semibold"
                                    >
                                        Go to Dashboard
                                    </Button>
                                )
                            ].filter(Boolean)}
                        >
                            {import.meta.env.DEV && !isChunkError && (
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


const ErrorBoundary = (props) => {
    const context = useLanguage();
    const t = context?.t || ((key) => key);
    return <ErrorBoundaryInternal {...props} t={t} />;
};

export default ErrorBoundary;

