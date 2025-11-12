import React from 'react';
import './PageInfo.css';

function HomePage() {
    return (
        <div className="page-info">
            <h1>Portable Virtual Agent Demo</h1>
            <div className="info-section">
                <h2>Welcome</h2>
                <p>
                    This application demonstrates different implementation patterns for the ServiceNow
                    Portable Virtual Agent. Use the navigation above to explore different authentication scenarios.
                </p>
            </div>

            <div className="info-section">
                <h2>Authentication Behavior</h2>
                <p>
                    <strong>Note:</strong> This page includes redirect logic for unauthenticated users.
                    When the Virtual Agent detects an unauthenticated session (via <code>SESSION_CREATED</code>
                    event with <code>authenticated: false</code> or <code>SESSION_LOGGED_OUT</code> event),
                    it will automatically redirect you to the ServiceNow SSO login page.
                </p>
                <p>
                    The redirect logic is implemented in <code>portable-va-loader.js</code> and applies
                    to all pages except the Public Virtual Agent page.
                </p>
            </div>

            <div className="info-section">
                <h2>Available Pages</h2>
                <ul>
                    <li>
                        <strong>Public Virtual Agent:</strong> Demonstrates a public-facing implementation
                        with no authentication redirect. Users can interact with the Virtual Agent without
                        being logged in.
                    </li>
                    <li>
                        <strong>Virtual Agent SSO Login:</strong> Demonstrates an authenticated implementation
                        where users must log in via ServiceNow SSO before interacting with the Virtual Agent.
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default HomePage;
