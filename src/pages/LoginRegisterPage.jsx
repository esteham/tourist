import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const apiURL = process.env.REACT_APP_API_URL;

function LoginRegisterPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    const loginData = {
      username: loginEmail,
      password: loginPassword,
    };

    try {
      const response = await fetch(`${apiURL}/backend/server/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        navigate(result.user.role === "admin" ? "/admin-dashboard" : "/");
      } else {
        setAuthError(result.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setAuthError("Login failed due to network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    if (registerPassword !== registerConfirm) {
      setAuthError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setAuthError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const userData = {
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    };

    try {
      const response = await fetch(`${apiURL}/backend/server/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setAuthError("Registration successful! Please login.");
        setActiveTab("login");
        // Clear form
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterConfirm("");
      } else {
        setAuthError(result.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setAuthError("Registration failed due to network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "#222" }}
    >
      <div className="modal-content border-0 shadow" style={modalStyle}>
        <div className="modal-header justify-content-center border-0 pb-2 position-relative">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "register" ? "active" : ""
                }`}
                onClick={() => setActiveTab("register")}
              >
                Register
              </button>
            </li>
          </ul>
        </div>

        <div className="modal-body px-4">
          {authError && (
            <div
              className={`alert ${
                authError.includes("successful")
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              <i
                className={`fas ${
                  authError.includes("successful")
                    ? "fa-check-circle"
                    : "fa-exclamation-circle"
                } me-2`}
              ></i>
              {authError}
            </div>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLogin}>
              <input
                type="email"
                className="form-control custom-input mb-3"
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control custom-input mb-3"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button
                className="btn btn-light w-100 custom-submit-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <input
                type="text"
                className="form-control custom-input mb-3"
                placeholder="Full Name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
              />
              <input
                type="email"
                className="form-control custom-input mb-3"
                placeholder="Email address"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control custom-input mb-3"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control custom-input mb-4"
                placeholder="Confirm Password"
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
                required
              />
              <button
                className="btn btn-light w-100 custom-submit-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const modalStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "16px",
  padding: "30px",
  color: "#fff",
  width: "400px",
  maxWidth: "100%",
};

const style = document.createElement("style");
style.innerHTML = `
  .custom-input {
    background rgba(255, 255, 255, 0.2);
    border none;
    color #fff;
    border-radius 12px;
    padding 12px 15px;
    box-shadow inset 0 0 5px rgba(255, 255, 255, 0.1);
    transition all 0.2s ease;
  }
  .custom-inputplaceholder {
    color rgba(255, 255, 255, 0.85);
  }
  .custom-inputfocus {
    background rgba(255, 255, 255, 0.2) !important;
    color #fff;
    box-shadow 0 0 0 2px rgba(255, 255, 255, 0.3);
    outline none;
  }
  .nav-tabs .nav-link {
    color #fff;
    border none;
    font-weight 500;
    padding 8px 20px;
  }
  .nav-tabs .nav-link.active {
    background rgba(255, 255, 255, 0.25);
    border-radius 8px;
    color #000;
  }
  .custom-submit-btn {
    background #ffffff;
    color #222;
    padding 10px;
    transition all 0.3s ease;
  }
  .custom-submit-btnhover {
    background #f8f9fa;
    transform translateY(-1px);
  }
`;
document.head.appendChild(style);

export default LoginRegisterPage;
