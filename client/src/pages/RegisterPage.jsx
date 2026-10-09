import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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
      await register(form);
      window.location.href = "/chat";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản để bắt đầu nhắn tin.</p>

        {error && <div className="error">{error}</div>}

        <label>Họ tên</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" />

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} placeholder="email@gmail.com" />

        <label>Mật khẩu</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự" />

        <button type="submit">Đăng ký</button>

        <span>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </span>
      </form>
    </div>
  );
};

export default RegisterPage;
