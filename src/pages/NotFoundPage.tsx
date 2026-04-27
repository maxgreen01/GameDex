//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import ErrorPage from "./ErrorPage";

const NotFoundPage: FC = () => {
    return (
        <>
            <ErrorPage errno={404} errorMessage={"The requested page is invalid or does not exist!"} />
        </>
    );
};

export default NotFoundPage;
