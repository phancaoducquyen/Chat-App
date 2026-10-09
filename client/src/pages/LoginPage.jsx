import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    await login(form);
    window.location.href = "/chat";
  } catch (err) {
    setError(err.message);
  }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>
        <p>Đăng nhập để sử dụng hệ thống chat realtime.</p>

        {error && <div className="error">{error}</div>}

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} placeholder="email@gmail.com" />

        <label>Mật khẩu</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Ít nhất vài ký tự" />

        <button type="submit">Đăng nhập</button>

        <span>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </span>
      </form>
    </div>
  );
};

export default LoginPage;
