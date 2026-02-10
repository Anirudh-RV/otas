import React, { createContext, useContext, useEffect, useState } from "react";
import { USER_AUTHENTICATE_V1_ENDPOINT } from "./constants";

interface User {
  ID: string;
  FirstName: string;
  MiddleName: string | null;
  LastName: string;
  EmailID: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      clearAuth();
      return;
    }

    try {
      const res = await fetch(USER_AUTHENTICATE_V1_ENDPOINT, {
        method: "POST",
        headers: {
          USER_TOKEN: token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const userFromApi = data.user;

        setUser(userFromApi);
        setAccessToken(token);
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
    localStorage.setItem("accessToken", token);
    setUser(user);
    setAccessToken(token);
  };

  const clearAuth = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, setAuth, clearAuth, refreshAuth, isLoading }}
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
