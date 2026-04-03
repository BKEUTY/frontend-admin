import Login from "../pages/Auth/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import NotFound from "../pages/ErrorPages/NotFound";
import ServerError from "../pages/ErrorPages/ServerError";

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
