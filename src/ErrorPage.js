import {Fragment} from "react";
import {useRouteError} from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();
    console.error('ErrorPage', {error});

    return (
        <Fragment>
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </Fragment>
    );
}