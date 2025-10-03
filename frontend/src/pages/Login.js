import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, password);

      // ✅ Save role (Admin or User) in localStorage
      localStorage.setItem("role", res.role);

      // ✅ Always go to SystemHome after login
      navigate("/system-home");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Warehouse Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
