import React, { createContext, useContext, useEffect, useState } from "react";
import { USER_AUTHENTICATE_V1_ENDPOINT } from "./constants";

interface User {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  otasAccessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [otasAccessToken, setotasAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    const token = localStorage.getItem("otasAccessToken");
    if (!token) {
      clearAuth();
      return;
    }

    try {
      const res = await fetch(USER_AUTHENTICATE_V1_ENDPOINT, {
        method: "POST",
        headers: {
          "X-OTAS-USER-TOKEN": token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const userFromApi = data.response_body.user;

        setUser(userFromApi);
        setotasAccessToken(token);
        localStorage.setItem("user", JSON.stringify(userFromApi));
      } else {
        console.warn("Authentication failed, logging out.");
        clearAuth();
      }
    } catch (err) {
      console.error("Network error during authentication:", err);
      clearAuth();
    }
  };

  useEffect(() => {
    refreshAuth().finally(() => setIsLoading(false));
  }, []);

  const setAuth = (user: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("otasAccessToken", token);
    setUser(user);
    setotasAccessToken(token);
  };

  const clearAuth = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("otasAccessToken");
    setUser(null);
    setotasAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        otasAccessToken,
        setAuth,
        clearAuth,
        refreshAuth,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
