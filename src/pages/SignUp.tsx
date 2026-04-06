import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateSignup} from "../../shared/validation";
import toast from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      validateSignup(email, password, username, displayName);

      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
          displayName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      toast.success("Account created!");
      navigate("/login");
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
      <h1>Signup</h1>

      <form onSubmit={handleSignup}>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
        <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <input placeholder="Display Name" onChange={(e) => setDisplayName(e.target.value)} />

        <button disabled={loading}>
          {loading ? "Creating..." : "Signup"}
        </button>
      </form>

      <button onClick={goHome}>Home</button>
    </div>
  );
}

export default Signup;