import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const apiURL = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Enhanced checkAuth function
  const checkAuth = async () => {
    try {
      const response = await fetch(`${apiURL}/backend/server/check_auth.php`, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const data = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
        // Store entire user object for completeness
        localStorage.setItem(
          "auth",
          JSON.stringify({
            isAuthenticated: true,
            user: data.user,
          })
        );
      } else {
        clearAuth();
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      // Fallback to localStorage if server is unreachable
      const localAuth = localStorage.getItem("auth");
      if (localAuth) {
        try {
          const parsed = JSON.parse(localAuth);
          if (parsed.isAuthenticated && parsed.user) {
            setUser(parsed.user);
          }
        } catch (e) {
          clearAuth();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  useEffect(() => {
    // Initial check
    checkAuth();

    // Set up periodic checks (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiURL}/backend/server/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        await checkAuth(); // Re-verify auth status after login
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.message);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(
        `${apiURL}/backend/server/logout.php`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        checkAuth, // expose checkAuth for manual refreshes
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
