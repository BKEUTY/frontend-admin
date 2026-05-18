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
import dayjs from 'dayjs';
import { useLanguage } from '@/store/LanguageContext';

const localeCache = {};

const LocalizedApp = () => {
    const { language } = useLanguage();
    const [antdLocale, setAntdLocale] = React.useState(null);
    
    React.useEffect(() => {
        const loadLocale = async () => {
            if (localeCache[language]) {
                setAntdLocale(localeCache[language]);
            } else {
                const localeModule = language === 'vi'
                    ? await import('antd/es/locale/vi_VN')
                    : await import('antd/es/locale/en_US');
                localeCache[language] = localeModule.default;
                setAntdLocale(localeModule.default);
            }
            if (language === 'vi') {
                await import('dayjs/locale/vi');
            }
            dayjs.locale(language);
        };
        loadLocale();
    }, [language]);

    const theme = React.useMemo(() => ({
        cssVar: true,
        hashed: false,
        token: {
            fontFamily: "'Be Vietnam Pro', sans-serif",
            colorPrimary: '#A10550',
            borderRadius: 16,
        },
    }), []);

    return (
        <ConfigProvider
            locale={antdLocale}
            theme={theme}
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
