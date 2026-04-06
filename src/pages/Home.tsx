import { Link } from "react-router-dom";

function Home() {
    return (
        <div>
            <h1>Welcome to GameDex!</h1>
            <h2>Track the games you've played. Discover what to play next.</h2>


            <Link to = {`/login`}>
                <button>Login</button>
            </Link>

            <Link to = {`/signup`}>
                <button>Signup</button>
            </Link>
           
        </div>
    )
}

export default Home; 