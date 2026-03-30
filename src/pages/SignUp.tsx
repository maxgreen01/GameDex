import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/auth";
import toast from "react-hot-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await signup(email, password, username, displayName);

      toast.success("Signup successful!");
      navigate("/login");

      setLoading(false);

    } catch (err: any) {
      toast.error(err.message || "Signup failed");
      setLoading(false);
    } 
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

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
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <button type = 'button' onClick={goHome}>Home</button>
    </div>
  );
}