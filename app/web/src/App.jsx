import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { NotificationProvider } from "@/store/NotificationContext";
import { LanguageProvider } from "@/store/LanguageContext";
import { AuthProvider } from "@/store/AuthContext";
import router from '@/routes';
import { ErrorBoundary, Skeleton } from "@/components/common";
import "./App.css";

function App() {
    return (
        <LanguageProvider>
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
        </LanguageProvider>
    );
}

export default App;
