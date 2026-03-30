import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);

      toast.success("Login successful!");
      navigate("/mainfeed");

      setLoading(false);

    } catch (err: any) {
      toast.error(err.message || "Login failed");
      setLoading(false);
    } 
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <button type = 'button' onClick={goHome}>Home</button>
    </div>
  );
}