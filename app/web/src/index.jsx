import "@/admin.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/700.css";
import "antd/dist/reset.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "./antd-custom.css";
import "./global.css";
import "./index.css";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => { });
  });
}

