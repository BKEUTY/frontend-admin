import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { NotificationProvider } from "@/store/NotificationContext";
import { LanguageProvider } from "@/store/LanguageContext";
import { AuthProvider } from "@/store/AuthContext";
import router from '@/routes';
import { ErrorBoundary, Skeleton } from "@/components/common";
import "./App.css";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

import { ConfigProvider } from 'antd';
import viVN from 'antd/es/locale/vi_VN';
import enUS from 'antd/es/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useLanguage } from '@/store/LanguageContext';

const LocalizedApp = () => {
    const { language } = useLanguage();
    
    const locale = language === 'vi' ? viVN : enUS;
    
    React.useEffect(() => {
        dayjs.locale(language);
    }, [language]);

    return (
        <ConfigProvider
            locale={locale}
            theme={{
                cssVar: true,
                hashed: false,
                token: {
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    colorPrimary: '#A10550',
                    borderRadius: 16,
                },
            }}
        >
            <NotificationProvider>
                <AuthProvider>
                    <ErrorBoundary>
                        <Suspense fallback={<div style={{ padding: '20px' }}><Skeleton width="100%" height="400px" /></div>}>
                            <div className="App">
                                <RouterProvider router={router} />
                            </div>
                        </Suspense>
                    </ErrorBoundary>
                </AuthProvider>
            </NotificationProvider>
        </ConfigProvider>
    );
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <LocalizedApp />
            </LanguageProvider>
        </QueryClientProvider>
    );
}

export default App;
