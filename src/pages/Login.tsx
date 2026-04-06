import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../services/auth";
import { validateLogin } from "../../shared/validation";
import { getDoc, doc} from "firebase/firestore";
import { db } from "../firebaseClient";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      validateLogin(email, password);
      
      const { user, token } = await login(email, password);

      const snap = await getDoc(doc(db, "users", user.uid));
      const username = snap.data()?.username;

      await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      localStorage.setItem("token", token);

      toast.success(`Welcome back ${user.email}`);
      navigate(`/mainfeed/${username}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigate('/');
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
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

      <button onClick={goHome}>Home</button>
    </div>

    
  );
}

export default Login;