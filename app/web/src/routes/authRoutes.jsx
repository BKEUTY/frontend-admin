import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import NotFound from "@/pages/error/NotFound";
import ServerError from "@/pages/error/ServerError";

export const authRoutes = [
    {
        path: "login",
        element: <Login />
    },
    {
        path: "forgot-password",
        element: <ForgotPassword />
    }
];

export const errorRoutes = [
    {
        path: "500",
        element: <ServerError />
    },
    {
        path: "*",
        element: <NotFound />
    }
];
