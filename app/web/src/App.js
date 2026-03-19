import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { NotificationProvider } from "./Context/NotificationContext";
import { LanguageProvider } from "./i18n/LanguageContext";
import { AuthProvider } from "./Context/AuthContext";
import AdminRoute from "./Component/Auth/AdminRoute";
import AdminLayout from "./Component/Admin/AdminLayout";
import { authRoutes, errorRoutes } from "./routes/authRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import ErrorBoundary from "./Component/ErrorBoundary/ErrorBoundary";
import Skeleton from "./Component/Common/Skeleton";
import "./App.css";

function Layout() {
  const location = useLocation();
  const path = location.pathname;

  const isAuth = path === "/login" || path === "/forgot-password";
  const isAdmin = path.startsWith("/admin");

  return (
    <div className="App">
      <main className={isAdmin || isAuth ? "" : "main_content"}>
        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: '20px' }}><Skeleton width="100%" height="400px" /></div>}>
            <Routes>
              {authRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} index={route.index} />
              ))}

              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                {adminRoutes.map((route, index) => (
                  <Route key={index} path={route.path} element={route.element} index={route.index} />
                ))}
              </Route>

              <Route path="/" element={<Navigate to="/admin" replace />} />

              {errorRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <Router>
          <AuthProvider>
            <Layout />
          </AuthProvider>
        </Router>
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;
