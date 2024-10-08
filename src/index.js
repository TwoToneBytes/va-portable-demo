import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import Root from './Root';
import reportWebVitals from './reportWebVitals';

import './index.css';
import ErrorPage from "./ErrorPage";

const router = createBrowserRouter([{
    path: '/',
    element: <Root/>,
    errorElement: <ErrorPage/>,
    children: [
        {
            path: '/public',
            element: () => <div>Public</div>
        },
        {
            path: '/sso',
            element: () => <div>SSO</div>
        }
    ]
}]);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
