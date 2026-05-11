//IMPORTS////////////////////////////////////////
import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../services/auth";
import { validateLogin } from "../../shared/validation";
//UI IMPORTS//////////////////////////////////////
import { Button, Box, AbsoluteCenter, Input, Stack, IconButton } from "@chakra-ui/react";
import { LuChevronLeft } from "react-icons/lu";
import AuthContext from "../components/Auth/AuthContext";

function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData = validateLogin({ email, password });

      // If we aren't logged in, we expect an auth state change, so mark client-side auth state as undetermined
      if (user === null) setUser(undefined);
      const { user: firebaseUser, token } = await login(loginData.email, loginData.password);
      localStorage.setItem("token", token);
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error("Failed to login");

      toast.success(`Welcome back ${firebaseUser.email}`);
      navigate("/mainfeed");
    } catch (err: any) {
      setUser(user); // Revert client-side auth state change
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigate("/");
  };

  if (user) {
    return <Navigate to="/mainfeed" />;
  }

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
