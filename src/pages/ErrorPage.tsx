//IMPORTS/////////////////////////////////////////
import { Button } from "@chakra-ui/react";
import type { FC } from "react";
import { Link } from "react-router-dom";

//-------------------------------------------------//

interface Props {
  errno?: number; // optional error code, e.g. 404, 500, etc.
  errorMessage: string;
}

const ErrorPage: FC<Props> = ({ errno, errorMessage }) => {
    return (
        <>
            {errno != undefined ? <h1>Error {errno}</h1> : <h1>Error!</h1>}

            <p className="error">{errorMessage}</p>

            <Link to="/">
                <Button>Back to Home</Button>
            </Link>
        </>
    );
};

export default ErrorPage;
