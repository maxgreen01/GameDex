//IMPORTS/////////////////////////////////////////
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
//UI IMPORTS//////////////////////////////////////
import { Button, ButtonGroup, Box, AbsoluteCenter, Image } from "@chakra-ui/react";
import AuthContext from "@/components/Auth/AuthContext.tsx";
import { useContext } from "react";

function Home() {
  const [user] = useContext(AuthContext);

  return (
    <div>
      <Box>
        <AbsoluteCenter>
          <Box>
            <Image
              src={logo}
              alt="Logo"
              height="16"
              mx="auto"
              className="logo-glow"
            ></Image>

            <h1>Welcome to GameDex!</h1>

            <h2>Track the games you've played. Discover what to play next.</h2>

            <ButtonGroup mt={12}>
              {user ? (
                <Link to={`/mainfeed`}>
                  <Button>Go to Main Feed</Button>
                </Link>
              ) : (
                <>
                  <Link to={`/login`}>
                    <Button>Login</Button>
                  </Link>

                  <Link to={`/signup`}>
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </ButtonGroup>
          </Box>
        </AbsoluteCenter>
      </Box>
    </div>
  );
}

export default Home;
