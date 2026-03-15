import Login from "../Component/Auth/Login";
import ForgotPassword from "../Component/Auth/ForgotPassword";
import NotFound from "../Component/ErrorPages/NotFound";
import ServerError from "../Component/ErrorPages/ServerError";

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
