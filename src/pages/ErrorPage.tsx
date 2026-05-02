//IMPORTS/////////////////////////////////////////
import { Button } from "@chakra-ui/react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import { getErrorInfo } from "../../shared/errors.ts";

//-------------------------------------------------//

interface Props {
  error?:
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
  if (error instanceof Error) {
    [errno, errorMessage] = getErrorInfo(error);
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
