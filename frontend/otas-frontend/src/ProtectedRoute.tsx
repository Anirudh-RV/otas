import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { JSX } from "react/jsx-runtime";
import AppTheme from "./shared-ui-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box
          sx={{
            height: "100vh",
            width: "100vw",
            backgroundColor: "background.default",
          }}
        />
      </AppTheme>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
