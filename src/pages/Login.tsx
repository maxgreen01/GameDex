//IMPORTS////////////////////////////////////////
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../services/auth";
import { validateLogin } from "../../shared/validation";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseClient";
//UI IMPORTS//////////////////////////////////////
import { Button, Box, AbsoluteCenter, Input, Stack, IconButton } from "@chakra-ui/react";
import { LuChevronLeft } from "react-icons/lu";

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
    navigate("/");
  };

  return (
    <div>
      <Box>
        <IconButton
          position="absolute"
          top="4"
          left="4"
          onClick={goHome}
          size="lg"
          variant="subtle"
        >
          <LuChevronLeft />
        </IconButton>
        {/* <Button >Home</Button> */}
        <AbsoluteCenter>
          <Box>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
              <Stack
                gap="4"
                maxW="lg"
              >
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Submit"}
                </Button>
              </Stack>
            </form>
          </Box>
        </AbsoluteCenter>
      </Box>
    </div>
  );
}

export default Login;
