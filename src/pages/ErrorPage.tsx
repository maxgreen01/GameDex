//IMPORTS/////////////////////////////////////////
import { Button } from "@chakra-ui/react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import { ValidationError } from "../../shared/validation";

//-------------------------------------------------//

interface Props {
    error?:
        | ValidationError
        | Error
        | {
              errno?: number; // optional error code, e.g. 404, 500, etc.
              errorMessage?: string;
          };
}

const ErrorPage: FC<Props> = ({ error }) => {
    let errno: number | undefined;
    let errorMessage: string | undefined;

    // Determine the error code and message based on the type of error
    if (error instanceof ValidationError) {
        errno = 400;
        errorMessage = error.message;
    } else if (error instanceof Error) {
        errno = 500;
        errorMessage = "Internal server error"; // Don't expose internal errors to the client
    } else {
        errno = error?.errno;
        errorMessage = error?.errorMessage;
    }
    
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
