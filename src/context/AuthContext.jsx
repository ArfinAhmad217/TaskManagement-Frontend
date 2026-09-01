import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const res = await axiosInstance.post("/Auth/login", { email, password });
    saveSession(res.data);
    return res.data;
  };

  const register = async (fullName, email, password) => {
    const res = await axiosInstance.post("/Auth/register", {
      fullName,
      email,
      password,
    });
    saveSession(res.data);
    return res.data;
  };

  const saveSession = (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    const userData = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}