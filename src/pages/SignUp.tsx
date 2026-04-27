//IMPORTS////////////////////////////////////////
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateSignup } from "../../shared/validation";

//UI IMPORTS//////////////////////////////////////
import { Button, Box, AbsoluteCenter, Input, Stack, IconButton } from "@chakra-ui/react";
import { LuChevronLeft } from "react-icons/lu";
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

      const res = await fetch("/auth/signup", {
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
        <AbsoluteCenter>
          <Box>
            <h1>Signup</h1>

            <form onSubmit={handleSignup}>
              <Stack
                gap="4"
                maxW="lg"
              >
                <Input
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  placeholder="Display Name"
                  onChange={(e) => setDisplayName(e.target.value)}
                />

                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Submit"}
                </Button>
              </Stack>
            </form>

            {/* <button onClick={goHome}>Home</button> */}
          </Box>
        </AbsoluteCenter>
      </Box>
    </div>
  );
}

export default Signup;
